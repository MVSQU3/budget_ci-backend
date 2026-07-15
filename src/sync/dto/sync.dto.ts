import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TransactionDto {
  @IsString() id: string;
  @IsIn(['depense', 'revenu']) type: 'depense' | 'revenu';
  @IsNumber() montant: number;
  @IsString() categorieId: string;
  @IsOptional() @IsString() note?: string;
  @IsString() date: string;
  @IsOptional() @IsBoolean() supprime?: boolean;
  @IsNumber() majLe: number;
}

export class BudgetDto {
  @IsString() categorieId: string;
  @IsNumber() montant: number;
  @IsNumber() majLe: number;
}

export class SyncDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetDto)
  budgets: BudgetDto[];
}
