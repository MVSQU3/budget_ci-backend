import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nacl from 'tweetnacl';
import { Abonnement } from './entities/abonnement.entity';

/** Contenu du jeton de licence. Doit rester identique côté app (utils/licence.js). */
export interface ChargeLicence {
  v: 1;
  userId: string;
  statut: 'essai' | 'actif' | 'expire';
  /** Fin de la période d'essai ou payée (ms). */
  periodeFinLe: number;
  /** Fin de la tolérance hors ligne (ms) : au-delà, l'app passe en lecture seule. */
  valideJusquA: number;
  emisLe: number;
}

/** Tolérance hors ligne au-delà de la fin de période. */
export const TOLERANCE_JOURS = 7;

const JOUR_MS = 24 * 60 * 60 * 1000;

/**
 * Émet des jetons de licence signés en Ed25519.
 *
 * L'app embarque uniquement la clé publique : elle peut vérifier un jeton hors
 * ligne, mais ne peut pas en fabriquer. La clé privée ne quitte jamais le serveur.
 */
@Injectable()
export class LicenceService implements OnModuleInit {
  private readonly logger = new Logger(LicenceService.name);
  private clePrivee: Uint8Array;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const b64 = this.config.get<string>('LICENCE_CLE_PRIVEE');

    if (!b64) {
      // Sans clé configurée, on en génère une éphémère pour ne pas bloquer le dev.
      // Elle change à chaque redémarrage : les jetons déjà émis deviennent invalides.
      const paire = nacl.sign.keyPair();
      this.clePrivee = paire.secretKey;
      this.logger.error(
        'LICENCE_CLE_PRIVEE absente — clé éphémère générée. ' +
          'NE JAMAIS DÉMARRER EN PRODUCTION AINSI. ' +
          'Génère une paire avec : node scripts/generer-cles-licence.js',
      );
      this.logger.warn(
        `Clé publique éphémère (à copier dans l'app pour tester) : ${Buffer.from(
          paire.publicKey,
        ).toString('base64')}`,
      );
      return;
    }

    const brut = Buffer.from(b64, 'base64');
    if (brut.length !== nacl.sign.secretKeyLength) {
      throw new Error(
        `LICENCE_CLE_PRIVEE invalide : ${brut.length} octets attendus ${nacl.sign.secretKeyLength}. ` +
          'Régénère-la avec node scripts/generer-cles-licence.js',
      );
    }
    this.clePrivee = new Uint8Array(brut);

    // On affiche la clé publique attendue : si les deux moitiés de la paire
    // divergent, l'app rejette les jetons avec un simple « signature invalide »
    // et rien n'indique d'où vient le problème. Ici, la comparaison est immédiate.
    const publique = Buffer.from(
      nacl.sign.keyPair.fromSecretKey(this.clePrivee).publicKey,
    ).toString('base64');
    this.logger.log(
      `Licence : clé de signature chargée. ` +
        `CLE_PUBLIQUE_B64 attendue dans mobile/src/utils/licence.js : ${publique}`,
    );
  }

  /** Statut réel à l'instant t : une période échue vaut expiration. */
  statutEffectif(abo: Abonnement, maintenant = Date.now()): ChargeLicence['statut'] {
    return Number(abo.periodeFinLe) > maintenant ? abo.statut : 'expire';
  }

  /** Construit et signe le jeton correspondant à un abonnement. */
  emettre(abo: Abonnement): string {
    const maintenant = Date.now();
    const periodeFinLe = Number(abo.periodeFinLe);

    const charge: ChargeLicence = {
      v: 1,
      userId: abo.userId,
      statut: this.statutEffectif(abo, maintenant),
      periodeFinLe,
      valideJusquA: periodeFinLe + TOLERANCE_JOURS * JOUR_MS,
      emisLe: maintenant,
    };

    const corps = Buffer.from(JSON.stringify(charge), 'utf8');
    const signature = nacl.sign.detached(new Uint8Array(corps), this.clePrivee);

    return `${corps.toString('base64')}.${Buffer.from(signature).toString('base64')}`;
  }
}
