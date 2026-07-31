import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { Otp } from "./entities/otp.entity";
import { SmsService } from "../sms/sms.service";
import { AbonnementsService } from "../billing/abonnements.service";
import { LoginDto, RegisterDto, VerifyOtpDto } from "./dto/auth.dto";
export declare class AuthService {
    private readonly users;
    private readonly otps;
    private readonly jwt;
    private readonly sms;
    private readonly abonnements;
    constructor(users: Repository<User>, otps: Repository<Otp>, jwt: JwtService, sms: SmsService, abonnements: AbonnementsService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    envoyerOtp(telephone: string): Promise<{
        message: string;
    }>;
    verifierOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        utilisateur: {
            id: string;
            nomUtilisateur: string;
            telephone: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        utilisateur: {
            id: string;
            nomUtilisateur: string;
            telephone: string;
        };
    } | {
        verificationRequise: boolean;
        message: string;
    }>;
    private emettreToken;
}
