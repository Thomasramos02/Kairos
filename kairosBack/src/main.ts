import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readKairosEnvironment } from './config/kairos-environment';

async function bootstrap(): Promise<void> {
  const kairosEnvironment = readKairosEnvironment(process.env);
  const application = await NestFactory.create(AppModule);

  application.enableCors();
  application.enableShutdownHooks();
  await application.listen(kairosEnvironment.port);
}

void bootstrap();
