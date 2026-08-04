import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { SyncModule } from "./sync/sync.module";
import { BillingModule } from "./billing/billing.module";
import { ENTITES } from "./data-source";
import { SchemaInitial1785841870130 } from "./migrations/1785841870130-SchemaInitial";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres" as const,
        host: config.get<string>("DATABASE_HOST", "localhost"),
        port: parseInt(config.get<string>("DATABASE_PORT", "5432"), 10),
        username: config.get<string>("DATABASE_USER", "postgres"),
        password: config.get<string>("DATABASE_PASSWORD", "postgres"),
        database: config.get<string>("DATABASE_NAME", "budget_fcfa"),
        entities: ENTITES,

        // Le schéma ne change plus que par migration relue et versionnée.
        // `synchronize` comparait les entités à la base et corrigeait l'écart
        // tout seul : une colonne renommée devenait un DROP suivi d'un ADD,
        // et les données de la colonne partaient avec.
        synchronize: false,

        // Migrations listées explicitement plutôt que par glob : après
        // compilation, un glob sur `dist` ne trouve rien et l'application
        // démarre en croyant le schéma à jour.
        migrations: [SchemaInitial1785841870130],

        // Appliquées au démarrage : déployer le code suffit à mettre le
        // schéma à niveau, sans étape manuelle qu'on peut oublier.
        migrationsRun: true,
      }),
    }),
    AuthModule,
    SyncModule,
    BillingModule,
  ],
})
export class AppModule {}
