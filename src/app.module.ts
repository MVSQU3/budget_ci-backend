import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { SyncModule } from "./sync/sync.module";
import { BillingModule } from "./billing/billing.module";
import { User } from "./users/user.entity";
import { Otp } from "./auth/entities/otp.entity";
import { Transaction } from "./sync/entities/transaction.entity";
import { Budget } from "./sync/entities/budget.entity";
import { Abonnement } from "./billing/entities/abonnement.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get("DATABASE_HOST", "localhost"),
        port: parseInt(config.get("DATABASE_PORT", "5432"), 10),
        username: config.get("DATABASE_USER", "postgres"),
        password: config.get("DATABASE_PASSWORD", "postgres"),
        database: config.get("DATABASE_NAME", "budget_fcfa"),
        entities: [User, Otp, Transaction, Budget, Abonnement],
        // synchronize: pratique en dev, à remplacer par des migrations en production
        synchronize: true,
      }),
    }),
    AuthModule,
    SyncModule,
    BillingModule,
  ],
})
export class AppModule {}
