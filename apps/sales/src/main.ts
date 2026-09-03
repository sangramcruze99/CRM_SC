import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.SALES_PORT ?? 3005;
  await app.listen(port);
  console.log(`[Sales Service] Ready on http://localhost:${port}`);
}
bootstrap();

