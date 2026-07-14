import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service d'envoi de SMS.
 * En dev (SMS_PROVIDER=console), le code est affiché dans les logs du serveur.
 * Pour la production, ajoute un cas 'orange' ou 'termii' dans envoyer().
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async envoyer(telephone: string, message: string): Promise<void> {
    const provider = this.config.get('SMS_PROVIDER', 'console');

    switch (provider) {
      case 'console':
        this.logger.log(`[SMS -> ${telephone}] ${message}`);
        return;
      // case 'orange': ... appel à l'API Orange SMS
      // case 'termii': ... appel à l'API Termii
      default:
        this.logger.warn(`Fournisseur SMS inconnu "${provider}", fallback console.`);
        this.logger.log(`[SMS -> ${telephone}] ${message}`);
    }
  }
}
