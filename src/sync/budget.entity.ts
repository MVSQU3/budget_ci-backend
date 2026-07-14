import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/** Budget mensuel d'une catégorie pour un utilisateur. */
@Entity('budgets')
export class Budget {
  @PrimaryColumn()
  id: string; // `${userId}:${categorieId}`

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
