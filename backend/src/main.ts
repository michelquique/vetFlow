import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('VetFlow API')
    .setDescription('Sistema de gestión veterinaria - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y autorización')
    .addTag('clients', 'Gestión de clientes')
    .addTag('pets', 'Gestión de mascotas')
    .addTag('doctors', 'Gestión de doctores')
    .addTag('consultations', 'Gestión de consultas médicas')
    .addTag('species', 'Tipos de especies')
    .addTag('breeds', 'Razas de animales')
    .addTag('certificates', 'Certificados veterinarios')
    .addTag('reminders', 'Recordatorios')
    .addTag('radiology', 'Informes radiológicos')
    .addTag('dashboard', 'Estadísticas y dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs\n`);
}
bootstrap();
