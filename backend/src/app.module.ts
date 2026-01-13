import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import entities
import { User } from './database/entities/user.entity';
import { Doctor } from './database/entities/doctor.entity';
import { Client } from './database/entities/client.entity';
import { SpeciesType } from './database/entities/species-type.entity';
import { Breed } from './database/entities/breed.entity';
import { Pet } from './database/entities/pet.entity';
import { Consultation } from './database/entities/consultation.entity';
import { Certificate } from './database/entities/certificate.entity';
import { RadiologicalReport } from './database/entities/radiological-report.entity';
import { Reminder } from './database/entities/reminder.entity';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { SpeciesModule } from './modules/species/species.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { PetsModule } from './modules/pets/pets.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'vetflow',
      entities: [
        User,
        Doctor,
        Client,
        SpeciesType,
        Breed,
        Pet,
        Consultation,
        Certificate,
        RadiologicalReport,
        Reminder,
      ],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    ClientsModule,
    DoctorsModule,
    SpeciesModule,
    BreedsModule,
    PetsModule,
    ConsultationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
