import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "./entities/transaction.entity";
import { Budget } from "./entities/budget.entity";
import { SyncDto } from "./dto/sync.dto";
import { AbonnementsService } from "../billing/abonnements.service";

/**
 * Synchronisation offline-first :
 * - le client pousse ses modifications (transactions + budgets) ;
 * - fusion « dernière modification gagne » (champ majLe) ;
 * - le serveur renvoie l'état complet de l'utilisateur.
 */
@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txs: Repository<Transaction>,
    @InjectRepository(Budget) private readonly budgets: Repository<Budget>,
    private readonly abonnements: AbonnementsService,
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
          note: t.note || "",
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

      // Fusion « dernière modification gagne » : une poussée plus ancienne
      // que ce qu'on a déjà en base est ignorée.
      if (existant && b.majLe <= Number(existant.majLe)) continue;

      // Un montant nul vaut suppression, mais on garde la ligne à 0 au lieu de
      // l'effacer : elle porte la date de suppression. Sans elle, un appareil
      // resté en arrière repousserait l'ancien montant et le ressusciterait,
      // puisqu'il n'y aurait plus rien à comparer. Elle n'est jamais renvoyée.
      if (Math.round(b.montant) <= 0) {
        await this.budgets.save({
          id,
          userId,
          categorieId: b.categorieId,
          montant: 0,
          majLe: b.majLe,
        });
        continue;
      }

      await this.budgets.save({
        id,
        userId,
        categorieId: b.categorieId,
        montant: Math.round(b.montant),
        majLe: b.majLe,
      });
    }

    // 3. Renvoyer l'état complet (y compris tombstones, pour propager les suppressions)
    //    ainsi qu'un jeton de licence frais : chaque sync repousse la tolérance hors ligne.
    const [transactions, tousBudgets, abonnement] = await Promise.all([
      this.txs.find({ where: { userId }, order: { date: "DESC" } }),
      this.budgets.find({ where: { userId } }),
      this.abonnements.etat(userId),
    ]);

    return {
      abonnement,
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
      // Les lignes à 0 sont des marqueurs de suppression, internes au serveur :
      // le client ne doit voir que les budgets réellement définis.
      budgets: tousBudgets
        .filter((b) => Number(b.montant) > 0)
        .map((b) => ({
          categorieId: b.categorieId,
          montant: Number(b.montant),
          majLe: Number(b.majLe),
        })),
      syncLe: Date.now(),
    };
  }
}
