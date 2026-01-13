import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Breed } from './breed.entity';
import { Pet } from './pet.entity';

@Entity('species_types')
export class SpeciesType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Breed, (breed) => breed.speciesType)
  breeds: Breed[];

  @OneToMany(() => Pet, (pet) => pet.speciesType)
  pets: Pet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
