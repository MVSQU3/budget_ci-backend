import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { MoreThan, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.entity";
import { Otp } from "./entities/otp.entity";
import { SmsService } from "../sms/sms.service";
import { AbonnementsService } from "../billing/abonnements.service";
import { LoginDto, RegisterDto, VerifyOtpDto } from "./dto/auth.dto";

const OTP_VALIDITE_MINUTES = 5;
const OTP_TENTATIVES_MAX = 5;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Otp) private readonly otps: Repository<Otp>,
    private readonly jwt: JwtService,
    private readonly sms: SmsService,
    private readonly abonnements: AbonnementsService,
  ) {}

  /** Inscription : crée le compte (non vérifié) et envoie un OTP par SMS. */
  async register(dto: RegisterDto) {
    console.log("CALL!")
    
    const existant = await this.users.findOne({
      where: [
        { telephone: dto.telephone },
        { nomUtilisateur: dto.nomUtilisateur },
      ],
    });
    if (existant) {
      throw new ConflictException(
        existant.telephone === dto.telephone
          ? "Ce numéro de téléphone est déjà utilisé"
          : "Ce nom d'utilisateur est déjà pris",
      );
    }

    const user = this.users.create({
      telephone: dto.telephone,
      nomUtilisateur: dto.nomUtilisateur,
      motDePasseHash: await bcrypt.hash(dto.motDePasse, 10),
    });
    await this.users.save(user);
    // L'essai démarre dès l'inscription, ancré sur le serveur : réinstaller l'app
    // ne le remet pas à zéro, et il faut un nouveau numéro vérifié pour en rouvrir un.
    await this.abonnements.ouvrirEssai(user.id);
    await this.envoyerOtp(dto.telephone);

    return {
      message: "Compte créé. Un code de vérification a été envoyé par SMS.",
    };
  }

  /** Génère et envoie un code OTP à 4 chiffres. */
  async envoyerOtp(telephone: string) {
    const user = await this.users.findOne({ where: { telephone } });
    if (!user) throw new BadRequestException("Aucun compte avec ce numéro");

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const otp = this.otps.create({
      telephone,
      codeHash: await bcrypt.hash(code, 10),
      expireLe: new Date(Date.now() + OTP_VALIDITE_MINUTES * 60 * 1000),
    });
    await this.otps.save(otp);

    await this.sms.envoyer(
      telephone,
      `Budget FCFA : votre code de vérification est ${code}. Valable ${OTP_VALIDITE_MINUTES} minutes.`,
    );
    return { message: "Code envoyé par SMS." };
  }

  /** Vérifie le code OTP et active le compte. Retourne un JWT. */
  async verifierOtp(dto: VerifyOtpDto) {
    const otp = await this.otps.findOne({
      where: {
        telephone: dto.telephone,
        utilise: false,
        expireLe: MoreThan(new Date()),
      },
      order: { creeLe: "DESC" },
    });
    if (!otp)
      throw new BadRequestException(
        "Code expiré ou introuvable. Demande un nouveau code.",
      );
    if (otp.tentatives >= OTP_TENTATIVES_MAX) {
      throw new BadRequestException(
        "Trop de tentatives. Demande un nouveau code.",
      );
    }

    const valide = await bcrypt.compare(dto.code, otp.codeHash);
    if (!valide) {
      otp.tentatives += 1;
      await this.otps.save(otp);
      throw new BadRequestException("Code incorrect");
    }

    otp.utilise = true;
    await this.otps.save(otp);

    const user = await this.users.findOne({
      where: { telephone: dto.telephone },
    });
    if (!user) throw new BadRequestException("Compte introuvable");
    user.telephoneVerifie = true;
    await this.users.save(user);

    return this.emettreToken(user);
  }

  /** Connexion par téléphone + mot de passe. */
  async login(dto: LoginDto) {
    console.log("CALL!")
    const user = await this.users.findOne({
      where: { telephone: dto.telephone },
    });
    if (!user || !(await bcrypt.compare(dto.motDePasse, user.motDePasseHash))) {
      throw new UnauthorizedException("Téléphone ou mot de passe incorrect");
    }
    if (!user.telephoneVerifie) {
      await this.envoyerOtp(user.telephone);
      return {
        verificationRequise: true,
        message: "Numéro non vérifié. Un code a été envoyé.",
      };
    }
    return this.emettreToken(user);
  }

  private emettreToken(user: User) {
    return {
      accessToken: this.jwt.sign({ sub: user.id, telephone: user.telephone }),
      utilisateur: {
        id: user.id,
        nomUtilisateur: user.nomUtilisateur,
        telephone: user.telephone,
      },
    };
  }
}
