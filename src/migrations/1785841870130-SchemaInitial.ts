import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaInitial1785841870130 implements MigrationInterface {
    name = 'SchemaInitial1785841870130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "telephone" character varying NOT NULL, "nomUtilisateur" character varying NOT NULL, "motDePasseHash" character varying NOT NULL, "telephoneVerifie" boolean NOT NULL DEFAULT false, "creeLe" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aacbcbfc16077f6b485951adfb4" UNIQUE ("telephone"), CONSTRAINT "UQ_0cf09c8d7e05c5a268524fe3e50" UNIQUE ("nomUtilisateur"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "telephone" character varying NOT NULL, "codeHash" character varying NOT NULL, "expireLe" TIMESTAMP NOT NULL, "tentatives" integer NOT NULL DEFAULT '0', "utilise" boolean NOT NULL DEFAULT false, "creeLe" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f268ff537f4ee1526d6463c479" ON "otps" ("telephone") `);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "type" character varying NOT NULL, "montant" bigint NOT NULL, "categorieId" character varying NOT NULL, "note" character varying NOT NULL DEFAULT '', "date" character varying NOT NULL, "supprime" boolean NOT NULL DEFAULT false, "majLe" bigint NOT NULL, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6bb58f2b6e30cb51a6504599f4" ON "transactions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_93cf840dcfab94b9bfac457ab9" ON "transactions" ("majLe") `);
        await queryRunner.query(`CREATE TABLE "budgets" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "categorieId" character varying NOT NULL, "montant" bigint NOT NULL, "majLe" bigint NOT NULL, CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_27e688ddf1ff3893b43065899f" ON "budgets" ("userId") `);
        await queryRunner.query(`CREATE TABLE "abonnements" ("userId" character varying NOT NULL, "statut" character varying NOT NULL DEFAULT 'essai', "periodeFinLe" bigint NOT NULL, "derniereRenouvellementLe" bigint, "moyenPaiement" character varying, "periodesPayees" integer NOT NULL DEFAULT '0', "creeLe" TIMESTAMP NOT NULL DEFAULT now(), "majLe" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d93627ef165e54f044e7976f68b" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3bff87f614e7724fbfcd1d5115" ON "abonnements" ("periodeFinLe") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3bff87f614e7724fbfcd1d5115"`);
        await queryRunner.query(`DROP TABLE "abonnements"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27e688ddf1ff3893b43065899f"`);
        await queryRunner.query(`DROP TABLE "budgets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93cf840dcfab94b9bfac457ab9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6bb58f2b6e30cb51a6504599f4"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f268ff537f4ee1526d6463c479"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
