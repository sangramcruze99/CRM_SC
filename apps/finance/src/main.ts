import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.FINANCE_PORT ?? 3015;
  await app.listen(port);
  console.log(`[Finance Service] Ready on port ${port}`);
}
bootstrap();

