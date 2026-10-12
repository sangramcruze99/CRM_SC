import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const port = process.env.PORTAL_PORT || 3029;
  await app.listen(port);
  console.log(`[Client Extranet Portal Microservice] Ready on http://localhost:${port}`);
}
bootstrap();
