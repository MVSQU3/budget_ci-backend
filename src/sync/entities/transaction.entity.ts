import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Transaction synchronisée. L'id est généré côté client (offline-first),
 * la suppression est un tombstone (supprime = true) pour se propager entre appareils.
 */
@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  type: 'depense' | 'revenu';

  @Column('bigint')
  montant: number;

  @Column()
  categorieId: string;

  @Column({ default: '' })
  note: string;

  @Column()
  date: string; // ISO, date de la transaction

  @Column({ default: false })
  supprime: boolean;

  @Index()
  @Column('bigint')
  majLe: number; // timestamp ms de dernière modification (LWW)
}
