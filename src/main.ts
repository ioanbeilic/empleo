import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { setup } from 'empleo-nestjs-common';
import { CvModule } from './cv.module';
import { CvOpenapi } from './cv.openapi';

async function bootstrap() {
  const app = await NestFactory.create(CvModule);

  setup(app);

  const cvOpenApi = app.get(CvOpenapi).getDocument();
  const cvDocument = SwaggerModule.createDocument(app, cvOpenApi);

  SwaggerModule.setup('openapi/ui', app, cvDocument);

  await app.listen(3000);
}

bootstrap().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
  process.exit(1);
});
