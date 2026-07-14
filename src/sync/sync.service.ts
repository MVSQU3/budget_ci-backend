import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';
import { SyncDto } from './sync.dto';

/**
 * Synchronisation offline-first :
 * - le client pousse ses modifications (transactions + budgets) ;
 * - fusion « dernière modification gagne » (champ majLe) ;
 * - le serveur renvoie l'état complet de l'utilisateur.
 */
@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Transaction) private readonly txs: Repository<Transaction>,
    @InjectRepository(Budget) private readonly budgets: Repository<Budget>,
  ) {}

  async synchroniser(userId: string, dto: SyncDto) {
    // 1. Fusionner les transactions poussées par le client
    for (const t of dto.transactions) {
      const existante = await this.txs.findOne({ where: { id: t.id, userId } });
      if (!existante || t.majLe > Number(existante.majLe)) {
        await this.txs.save({
          id: t.id,
          userId,
          type: t.type,
          montant: Math.round(t.montant),
          categorieId: t.categorieId,
          note: t.note || '',
          date: t.date,
          supprime: !!t.supprime,
          majLe: t.majLe,
        });
      }
    }

    // 2. Fusionner les budgets
    for (const b of dto.budgets) {
      const id = `${userId}:${b.categorieId}`;
      const existant = await this.budgets.findOne({ where: { id } });
      if (!existant || b.majLe > Number(existant.majLe)) {
        await this.budgets.save({
          id,
          userId,
          categorieId: b.categorieId,
          montant: Math.round(b.montant),
          majLe: b.majLe,
        });
      }
    }

    // 3. Renvoyer l'état complet (y compris tombstones, pour propager les suppressions)
    const [transactions, tousBudgets] = await Promise.all([
      this.txs.find({ where: { userId }, order: { date: 'DESC' } }),
      this.budgets.find({ where: { userId } }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        montant: Number(t.montant),
        categorieId: t.categorieId,
        note: t.note,
        date: t.date,
        supprime: t.supprime,
        majLe: Number(t.majLe),
      })),
      budgets: tousBudgets.map((b) => ({
        categorieId: b.categorieId,
        montant: Number(b.montant),
        majLe: Number(b.majLe),
      })),
      syncLe: Date.now(),
    };
  }
}
