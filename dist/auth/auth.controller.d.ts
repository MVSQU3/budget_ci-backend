import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
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
    verifierOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        utilisateur: {
            id: string;
            nomUtilisateur: string;
            telephone: string;
        };
    }>;
    renvoyerOtp(dto: ResendOtpDto): Promise<{
        message: string;
    }>;
    me(req: any): any;
}
