import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Client } from './client.entity';
import { Doctor } from './doctor.entity';
import { RadiologicalReport } from './radiological-report.entity';

export enum ConsultationType {
  CURATIVA = 'Curativa',
  PROFILACTICA = 'Profilactica',
}

export enum ConsultationStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, generated: 'increment' })
  consultationNumber: number;

  @ManyToOne(() => Pet, (pet) => pet.consultations, { eager: true })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => Client, (client) => client.consultations, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.consultations, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({
    type: 'enum',
    enum: ConsultationType,
  })
  type: ConsultationType;

  // Anamnesis
  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  symptoms: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  // Treatment Plan
  @Column({ type: 'text', nullable: true })
  treatment: string;

  @Column({ type: 'text', nullable: true })
  exams: string;

  // Follow-up
  @Column({ type: 'date', nullable: true })
  nextVisitDate: Date;

  @Column({
    type: 'enum',
    enum: ConsultationType,
    nullable: true,
  })
  nextVisitType: ConsultationType;

  @Column({ type: 'text', nullable: true })
  nextTreatment: string;

  // Financial
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({
    type: 'enum',
    enum: ConsultationStatus,
    default: ConsultationStatus.ACTIVE,
  })
  status: ConsultationStatus;

  @OneToMany(() => RadiologicalReport, (report) => report.consultation)
  radiologicalReports: RadiologicalReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
