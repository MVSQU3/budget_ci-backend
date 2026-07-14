import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // l'app mobile appelle depuis Expo
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API démarrée sur http://localhost:${port}`);
}
bootstrap();
