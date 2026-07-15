import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { Budget } from "./entities/budget.entity";
import { SyncController } from "./sync.controller";
import { SyncService } from "./sync.service";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget])],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
