import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Abonnement } from './entities/abonnement.entity';
import { LicenceService, TOLERANCE_JOURS } from './licence.service';

const JOUR_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AbonnementsService {
  constructor(
    @InjectRepository(Abonnement)
    private readonly abos: Repository<Abonnement>,
    private readonly licences: LicenceService,
    private readonly config: ConfigService,
  ) {}

  private get essaiJours(): number {
    return parseInt(this.config.get('ESSAI_JOURS', '14'), 10);
  }

  private get periodeJours(): number {
    return parseInt(this.config.get('ABONNEMENT_JOURS', '30'), 10);
  }

  /**
   * Ouvre la période d'essai. Appelé à l'inscription.
   *
   * L'essai est ancré sur le serveur et sur un numéro vérifié par SMS :
   * réinstaller l'app ne le remet pas à zéro. Idempotent — un compte déjà
   * connu conserve son essai d'origine.
   */
  async ouvrirEssai(userId: string): Promise<Abonnement> {
    const existant = await this.abos.findOne({ where: { userId } });
    if (existant) return existant;

    return this.abos.save(
      this.abos.create({
        userId,
        statut: 'essai',
        periodeFinLe: Date.now() + this.essaiJours * JOUR_MS,
        periodesPayees: 0,
      }),
    );
  }

  /**
   * Abonnement d'un utilisateur, en ouvrant un essai s'il n'en a pas encore.
   * Le filet couvre les comptes créés avant l'existence de cette table.
   */
  async pourUtilisateur(userId: string): Promise<Abonnement> {
    return (await this.abos.findOne({ where: { userId } })) ?? this.ouvrirEssai(userId);
  }

  /**
   * Crédite une période payée. À appeler depuis le webhook d'encaissement,
   * jamais depuis une route pilotée par le client.
   *
   * Si l'abonnement court encore, la nouvelle période prolonge l'existante :
   * payer en avance ne fait pas perdre les jours restants.
   */
  async crediterPeriode(userId: string, moyenPaiement: string): Promise<Abonnement> {
    const abo = await this.pourUtilisateur(userId);
    const maintenant = Date.now();
    const base = Math.max(Number(abo.periodeFinLe), maintenant);

    abo.statut = 'actif';
    abo.periodeFinLe = base + this.periodeJours * JOUR_MS;
    abo.derniereRenouvellementLe = maintenant;
    abo.moyenPaiement = moyenPaiement;
    abo.periodesPayees = abo.periodesPayees + 1;

    return this.abos.save(abo);
  }

  /** État complet renvoyé au client : le jeton signé plus de quoi l'afficher. */
  async etat(userId: string) {
    const abo = await this.pourUtilisateur(userId);
    const maintenant = Date.now();
    const periodeFinLe = Number(abo.periodeFinLe);

    return {
      licence: this.licences.emettre(abo),
      statut: this.licences.statutEffectif(abo, maintenant),
      periodeFinLe,
      valideJusquA: periodeFinLe + TOLERANCE_JOURS * JOUR_MS,
      joursRestants: Math.max(0, Math.ceil((periodeFinLe - maintenant) / JOUR_MS)),
      periodesPayees: abo.periodesPayees,
    };
  }
}
