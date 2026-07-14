import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('otp/verify')
  verifierOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifierOtp(dto);
  }

  @Post('otp/resend')
  renvoyerOtp(@Body() dto: ResendOtpDto) {
    return this.auth.envoyerOtp(dto.telephone);
  }

  /** Exemple de route protégée : profil de l'utilisateur connecté. */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Request() req: any) {
    return req.user;
  }
}
