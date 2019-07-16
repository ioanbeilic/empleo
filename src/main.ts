import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { setup } from 'empleo-nestjs-common';
import { AppModule } from './app.module';
import { CvOpenApi } from './cv.openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setup(app);

  const openApi = app.get(CvOpenApi).getDocument();
  const document = SwaggerModule.createDocument(app, openApi, {
    include: [] // include modules
  });
  SwaggerModule.setup('openapi/ui', app, document);

  await app.listen(3000);
}

bootstrap().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
  process.exit(1);
});
