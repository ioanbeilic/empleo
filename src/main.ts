import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setup } from 'empleo-nestjs-common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setup(app);

  await app.listen(3000);
}

bootstrap().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
  process.exit(1);
});
