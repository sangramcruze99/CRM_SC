import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const port = process.env.STORAGE_PORT || 3031;
  await app.listen(port);
  console.log(`[Media & Storage Microservice] Ready on http://localhost:${port}`);
}
bootstrap();
