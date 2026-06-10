import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { readKairosEnvironment } from './config/kairos-environment';

async function bootstrap(): Promise<void> {
  const kairosEnvironment = readKairosEnvironment(process.env);
  const application = await NestFactory.create(AppModule);

  application.use(cookieParser());
  application.setGlobalPrefix('kairos-api');
  application.enableCors();
  application.enableShutdownHooks();
  await application.listen(kairosEnvironment.port);
}

void bootstrap();
