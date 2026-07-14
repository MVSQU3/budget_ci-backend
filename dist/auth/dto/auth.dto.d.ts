export declare class RegisterDto {
    nomUtilisateur: string;
    telephone: string;
    motDePasse: string;
}
export declare class LoginDto {
    telephone: string;
    motDePasse: string;
}
export declare class VerifyOtpDto {
    telephone: string;
    code: string;
}
export declare class ResendOtpDto {
    telephone: string;
}
