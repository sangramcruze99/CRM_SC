import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const port = process.env.NOTIFICATIONS_PORT || 3028;
  await app.listen(port);
  console.log(`[Notifications Hub Microservice] Ready on http://localhost:${port}`);
}
bootstrap();
