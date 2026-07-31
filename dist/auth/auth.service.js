"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/user.entity");
const otp_entity_1 = require("./entities/otp.entity");
const sms_service_1 = require("../sms/sms.service");
const abonnements_service_1 = require("../billing/abonnements.service");
const OTP_VALIDITE_MINUTES = 5;
const OTP_TENTATIVES_MAX = 5;
let AuthService = class AuthService {
    constructor(users, otps, jwt, sms, abonnements) {
        this.users = users;
        this.otps = otps;
        this.jwt = jwt;
        this.sms = sms;
        this.abonnements = abonnements;
    }
    async register(dto) {
        console.log("CALL!");
        const existant = await this.users.findOne({
            where: [
                { telephone: dto.telephone },
                { nomUtilisateur: dto.nomUtilisateur },
            ],
        });
        if (existant) {
            throw new common_1.ConflictException(existant.telephone === dto.telephone
                ? "Ce numéro de téléphone est déjà utilisé"
                : "Ce nom d'utilisateur est déjà pris");
        }
        const user = this.users.create({
            telephone: dto.telephone,
            nomUtilisateur: dto.nomUtilisateur,
            motDePasseHash: await bcrypt.hash(dto.motDePasse, 10),
        });
        await this.users.save(user);
        await this.abonnements.ouvrirEssai(user.id);
        await this.envoyerOtp(dto.telephone);
        return {
            message: "Compte créé. Un code de vérification a été envoyé par SMS.",
        };
    }
    async envoyerOtp(telephone) {
        const user = await this.users.findOne({ where: { telephone } });
        if (!user)
            throw new common_1.BadRequestException("Aucun compte avec ce numéro");
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const otp = this.otps.create({
            telephone,
            codeHash: await bcrypt.hash(code, 10),
            expireLe: new Date(Date.now() + OTP_VALIDITE_MINUTES * 60 * 1000),
        });
        await this.otps.save(otp);
        await this.sms.envoyer(telephone, `Budget FCFA : votre code de vérification est ${code}. Valable ${OTP_VALIDITE_MINUTES} minutes.`);
        return { message: "Code envoyé par SMS." };
    }
    async verifierOtp(dto) {
        const otp = await this.otps.findOne({
            where: {
                telephone: dto.telephone,
                utilise: false,
                expireLe: (0, typeorm_2.MoreThan)(new Date()),
            },
            order: { creeLe: "DESC" },
        });
        if (!otp)
            throw new common_1.BadRequestException("Code expiré ou introuvable. Demande un nouveau code.");
        if (otp.tentatives >= OTP_TENTATIVES_MAX) {
            throw new common_1.BadRequestException("Trop de tentatives. Demande un nouveau code.");
        }
        const valide = await bcrypt.compare(dto.code, otp.codeHash);
        if (!valide) {
            otp.tentatives += 1;
            await this.otps.save(otp);
            throw new common_1.BadRequestException("Code incorrect");
        }
        otp.utilise = true;
        await this.otps.save(otp);
        const user = await this.users.findOne({
            where: { telephone: dto.telephone },
        });
        if (!user)
            throw new common_1.BadRequestException("Compte introuvable");
        user.telephoneVerifie = true;
        await this.users.save(user);
        return this.emettreToken(user);
    }
    async login(dto) {
        console.log("CALL!");
        const user = await this.users.findOne({
            where: { telephone: dto.telephone },
        });
        if (!user || !(await bcrypt.compare(dto.motDePasse, user.motDePasseHash))) {
            throw new common_1.UnauthorizedException("Téléphone ou mot de passe incorrect");
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
    emettreToken(user) {
        return {
            accessToken: this.jwt.sign({ sub: user.id, telephone: user.telephone }),
            utilisateur: {
                id: user.id,
                nomUtilisateur: user.nomUtilisateur,
                telephone: user.telephone,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(otp_entity_1.Otp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        sms_service_1.SmsService,
        abonnements_service_1.AbonnementsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map