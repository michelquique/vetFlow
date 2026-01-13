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
import { Doctor } from './doctor.entity';

export enum CertificateType {
  HEALTH = 'Health',
  VACCINATION = 'Vaccination',
  TRAVEL = 'Travel',
  DEATH = 'Death',
  OTHER = 'Other',
}

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.certificates, { eager: true })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.certificates, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: string;

  @Column({ unique: true, generated: 'increment' })
  certificateNumber: number;

  @Column({
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.HEALTH,
  })
  type: CertificateType;

  @Column({ type: 'date' })
  issuedDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
