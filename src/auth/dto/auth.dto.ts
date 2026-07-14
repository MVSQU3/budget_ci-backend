import { IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

const TELEPHONE_REGEX = /^\+\d{8,15}$/; // format international : +225..., +221..., +237...

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: "Le nom d'utilisateur doit faire au moins 3 caractères" })
  nomUtilisateur: string;

  @Matches(TELEPHONE_REGEX, { message: 'Téléphone au format international requis (ex. +2250701020304)' })
  telephone: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  motDePasse: string;
}

export class LoginDto {
  @Matches(TELEPHONE_REGEX, { message: 'Téléphone au format international requis' })
  telephone: string;

  @IsString()
  @IsNotEmpty()
  motDePasse: string;
}

export class VerifyOtpDto {
  @Matches(TELEPHONE_REGEX, { message: 'Téléphone au format international requis' })
  telephone: string;

  @IsString()
  @Length(4, 4, { message: 'Le code doit faire 4 chiffres' })
  code: string;
}

export class ResendOtpDto {
  @Matches(TELEPHONE_REGEX, { message: 'Téléphone au format international requis' })
  telephone: string;
}
