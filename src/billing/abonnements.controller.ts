import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AbonnementsService } from './abonnements.service';

@UseGuards(AuthGuard('jwt'))
@Controller('licence')
export class AbonnementsController {
  constructor(private readonly abonnements: AbonnementsService) {}

  /**
   * Jeton de licence de l'utilisateur connecté.
   *
   * L'app le rafraîchit de façon opportuniste — la synchronisation le renvoie
   * déjà dans sa réponse, cette route sert au démarrage et au retour du réseau.
   */
  @Get()
  licence(@Request() req: any) {
    return this.abonnements.etat(req.user.userId);
  }
}
