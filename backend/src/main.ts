import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Habilitar CORS para integración con Frontend (Vite)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Pipe global de validación (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TaskAI - Sistema de Gestión de Tareas Inteligente')
    .setDescription(
      'Documentación OpenAPI interactiva de la API REST de TaskAI. ' +
      'Incluye reglas de negocio: Asignación automática de prioridad Alta para títulos con "Urgente" (RF-02), ' +
      'Validación de fecha límite no anterior a hoy (RF-03), y Soft Delete (RF-05).',
    )
    .setVersion('1.0.0')
    .addTag('Tareas (Tasks)', 'Operaciones de gestión, consulta y ciclo de vida de tareas')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'TaskAI API - Swagger Documentation',
  });

  // Exportar especificación OpenAPI en formato JSON para entrega / evaluadores
  try {
    const openApiJsonPath = path.resolve(__dirname, '..', 'openapi.json');
    fs.writeFileSync(openApiJsonPath, JSON.stringify(document, null, 2), 'utf-8');
  } catch (error) {
    console.warn('No se pudo generar openapi.json:', error);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor TaskAI Backend corriendo en http://localhost:${port}/api`);
  console.log(`📄 Documentación Swagger disponible en http://localhost:${port}/api/docs`);
}
bootstrap();
