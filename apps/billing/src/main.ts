import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors();
  const port = process.env.BILLING_PORT || 3027;
  await app.listen(port);
  console.log(`[Billing Microservice] Ready on http://localhost:${port}`);
}
bootstrap();
