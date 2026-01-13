import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { SpeciesType } from './species-type.entity';
import { Breed } from './breed.entity';
import { Consultation } from './consultation.entity';
import { Certificate } from './certificate.entity';
import { RadiologicalReport } from './radiological-report.entity';
import { Reminder } from './reminder.entity';

export enum PetSex {
  MALE = 'M',
  FEMALE = 'F',
}

export enum PetSize {
  SMALL = 'S',
  MEDIUM = 'M',
  LARGE = 'L',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, generated: 'increment' })
  ficha: number;

  @Column()
  name: string;

  @ManyToOne(() => Client, (client) => client.pets, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @ManyToOne(() => SpeciesType, (speciesType) => speciesType.pets, {
    eager: true,
  })
  @JoinColumn({ name: 'speciesTypeId' })
  speciesType: SpeciesType;

  @Column()
  speciesTypeId: string;

  @ManyToOne(() => Breed, (breed) => breed.pets, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'breedId' })
  breed: Breed;

  @Column({ nullable: true })
  breedId: string;

  @Column({
    type: 'enum',
    enum: PetSex,
  })
  sex: PetSex;

  @Column({
    type: 'enum',
    enum: PetSize,
  })
  size: PetSize;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ default: true })
  isAlive: boolean;

  @Column({ type: 'date', nullable: true })
  deathDate: Date;

  @Column({ nullable: true })
  photoUrl: string;

  @OneToMany(() => Consultation, (consultation) => consultation.pet)
  consultations: Consultation[];

  @OneToMany(() => Certificate, (certificate) => certificate.pet)
  certificates: Certificate[];

  @OneToMany(() => RadiologicalReport, (report) => report.pet)
  radiologicalReports: RadiologicalReport[];

  @OneToMany(() => Reminder, (reminder) => reminder.pet)
  reminders: Reminder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
