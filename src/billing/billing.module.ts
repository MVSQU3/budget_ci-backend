import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Abonnement } from './entities/abonnement.entity';
import { AbonnementsService } from './abonnements.service';
import { AbonnementsController } from './abonnements.controller';
import { LicenceService } from './licence.service';

@Module({
  imports: [TypeOrmModule.forFeature([Abonnement])],
  controllers: [AbonnementsController],
  providers: [AbonnementsService, LicenceService],
  // AuthModule ouvre l'essai à l'inscription, SyncModule joint la licence à la sync
  exports: [AbonnementsService, LicenceService],
})
export class BillingModule {}
