import { NestFactory } from '@nestjs/core';
import { setup } from 'empleo-nestjs-common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setup(app);
}

bootstrap().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
  process.exit(1);
});
