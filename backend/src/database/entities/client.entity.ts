import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Consultation } from './consultation.entity';
import { Reminder } from './reminder.entity';

export enum ClientType {
  NORMAL = 'Normal',
  VIP = 'VIP',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  rut: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  commune: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ClientType,
    default: ClientType.NORMAL,
  })
  clientType: ClientType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  city: string;

  @OneToMany(() => Pet, (pet) => pet.client)
  pets: Pet[];

  @OneToMany(() => Consultation, (consultation) => consultation.client)
  consultations: Consultation[];

  @OneToMany(() => Reminder, (reminder) => reminder.client)
  reminders: Reminder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
