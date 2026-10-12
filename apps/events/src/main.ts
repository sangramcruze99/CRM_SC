import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const port = process.env.EVENTS_PORT || 3032;
  await app.listen(port);
  console.log(`[Transactional Event Broker Microservice] Ready on http://localhost:${port}`);
}
bootstrap();
