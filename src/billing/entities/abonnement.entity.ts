import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type StatutAbonnement = 'essai' | 'actif' | 'expire';

/**
 * Abonnement mensuel d'un utilisateur.
 *
 * `periodeFinLe` est la seule date qui fait autorité : le serveur la calcule,
 * le client ne fait que la lire à travers un jeton signé. Le statut `expire`
 * n'est pas stocké mais dérivé — une période échue vaut expiration, sans qu'il
 * faille une tâche planifiée pour repasser les lignes une à une.
 */
@Entity('abonnements')
export class Abonnement {
  /** Un abonnement par utilisateur : la clé primaire est l'userId. */
  @PrimaryColumn()
  userId: string;

  /** 'essai' ou 'actif'. L'expiration se déduit de `periodeFinLe`. */
  @Column({ default: 'essai' })
  statut: StatutAbonnement;

  @Index()
  @Column('bigint')
  periodeFinLe: number; // timestamp ms — fin de la période d'essai ou payée

  @Column('bigint', { nullable: true })
  derniereRenouvellementLe: number | null;

  // Type explicite : `string | null` se réifie en `Object`, que TypeORM ne sait pas mapper
  @Column('varchar', { nullable: true })
  moyenPaiement: string | null; // wave | orange_money | mtn | play …

  /** Nombre de périodes payées — utile pour distinguer un nouveau d'un fidèle. */
  @Column({ default: 0 })
  periodesPayees: number;

  @CreateDateColumn()
  creeLe: Date;

  @UpdateDateColumn()
  majLe: Date;
}
