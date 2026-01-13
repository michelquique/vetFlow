import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Consultation } from './consultation.entity';
import { Pet } from './pet.entity';
import { Doctor } from './doctor.entity';

@Entity('radiological_reports')
export class RadiologicalReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Consultation, (consultation) => consultation.radiologicalReports, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'consultationId' })
  consultation: Consultation;

  @Column({ nullable: true })
  consultationId: string;

  @ManyToOne(() => Pet, (pet) => pet.radiologicalReports, { eager: true })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.radiologicalReports, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: string;

  @Column({ type: 'date' })
  reportDate: Date;

  @Column({ type: 'text' })
  findings: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
