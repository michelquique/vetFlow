import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { SpeciesType } from '../../database/entities/species-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpeciesType])],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
