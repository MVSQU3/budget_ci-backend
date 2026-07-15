import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  telephone: string;

  @Column()
  codeHash: string;

  @Column()
  expireLe: Date;

  @Column({ default: 0 })
  tentatives: number;

  @Column({ default: false })
  utilise: boolean;

  @CreateDateColumn()
  creeLe: Date;
}
