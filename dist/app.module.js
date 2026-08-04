"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const sync_module_1 = require("./sync/sync.module");
const billing_module_1 = require("./billing/billing.module");
const data_source_1 = require("./data-source");
const _1785841870130_SchemaInitial_1 = require("./migrations/1785841870130-SchemaInitial");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: "postgres",
                    host: config.get("DATABASE_HOST", "localhost"),
                    port: parseInt(config.get("DATABASE_PORT", "5432"), 10),
                    username: config.get("DATABASE_USER", "postgres"),
                    password: config.get("DATABASE_PASSWORD", "postgres"),
                    database: config.get("DATABASE_NAME", "budget_fcfa"),
                    entities: data_source_1.ENTITES,
                    synchronize: false,
                    migrations: [_1785841870130_SchemaInitial_1.SchemaInitial1785841870130],
                    migrationsRun: true,
                }),
            }),
            auth_module_1.AuthModule,
            sync_module_1.SyncModule,
            billing_module_1.BillingModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map