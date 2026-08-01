import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/** Budget mensuel d'une catégorie pour un utilisateur. */
@Entity('budgets')
export class Budget {
  // Pas un uuid : clé composite lisible `${userId}:${categorieId}`,
  // qui garantit un seul budget par catégorie et par utilisateur.
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  categorieId: string;

  @Column('bigint')
  montant: number;

  @Column('bigint')
  majLe: number; // timestamp ms (LWW)
}
