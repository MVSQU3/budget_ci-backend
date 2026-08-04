import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Otp } from './auth/entities/otp.entity';
import { Transaction } from './sync/entities/transaction.entity';
import { Budget } from './sync/entities/budget.entity';
import { Abonnement } from './billing/entities/abonnement.entity';

export const ENTITES = [User, Otp, Transaction, Budget, Abonnement];

/**
 * Configuration de base de données partagée par l'application et la CLI TypeORM.
 *
 * Un seul endroit décrit la connexion et la liste des entités : sans ça, la CLI
 * et le serveur peuvent diverger, et une migration générée ne correspond plus
 * à ce que l'application attend réellement.
 */
export const optionsBdd = {
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'budget_fcfa',
  entities: ENTITES,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Jamais de synchronisation automatique : le schéma ne change que par migration,
  // relue et versionnée. C'est ce qui empêche une modification d'entité d'effacer
  // silencieusement des colonnes — et donc des données — en production.
  synchronize: false,
};

/** Utilisée par la CLI TypeORM (`npm run migration:*`). */
export default new DataSource(optionsBdd);
