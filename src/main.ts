import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { setup } from 'empleo-nestjs-common';
import { AppModule } from './app.module';
import { EducationsModule } from './modules/educations.module';
import { OpenApi } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setup(app);

  const openApi = app.get(OpenApi).getDocument();
  const document = SwaggerModule.createDocument(app, openApi, {
    include: [EducationsModule] // include modules
  });
  SwaggerModule.setup('openapi/ui', app, document);

  await app.listen(3000);
}

bootstrap().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
  process.exit(1);
});
