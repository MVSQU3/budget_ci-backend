import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  telephone: string; // format international, ex. +2250701020304

  @Column({ unique: true })
  nomUtilisateur: string;

  @Column()
  motDePasseHash: string;

  @Column({ default: false })
  telephoneVerifie: boolean;

  @CreateDateColumn()
  creeLe: Date;
}
