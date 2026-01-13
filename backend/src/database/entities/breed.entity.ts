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
import { SpeciesType } from './species-type.entity';
import { Pet } from './pet.entity';

@Entity('breeds')
export class Breed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => SpeciesType, (speciesType) => speciesType.breeds, {
    eager: true,
  })
  @JoinColumn({ name: 'speciesTypeId' })
  speciesType: SpeciesType;

  @Column()
  speciesTypeId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Pet, (pet) => pet.breed)
  pets: Pet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
