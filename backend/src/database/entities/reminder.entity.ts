import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Client } from './client.entity';

export enum ReminderType {
  VACCINATION = 'Vaccination',
  CHECKUP = 'Checkup',
  MEDICATION = 'Medication',
  DEWORMING = 'Deworming',
  OTHER = 'Other',
}

export enum ReminderStatus {
  PENDING = 'Pending',
  SENT = 'Sent',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.reminders, { eager: true })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => Client, (client) => client.reminders, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
  })
  type: ReminderType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ default: false })
  notificationSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
