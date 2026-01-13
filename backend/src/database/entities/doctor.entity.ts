import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Consultation } from './consultation.entity';
import { Certificate } from './certificate.entity';
import { RadiologicalReport } from './radiological-report.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true, unique: true })
  licenseNumber: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Consultation, (consultation) => consultation.doctor)
  consultations: Consultation[];

  @OneToMany(() => Certificate, (certificate) => certificate.doctor)
  certificates: Certificate[];

  @OneToMany(() => RadiologicalReport, (report) => report.doctor)
  radiologicalReports: RadiologicalReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
