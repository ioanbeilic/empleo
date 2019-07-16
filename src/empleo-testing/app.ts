import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { setup } from 'empleo-nestjs-common';

export async function startApp(appModule: any): Promise<NestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [appModule]
  }).compile();

  const app = moduleFixture.createNestApplication();

  setup(app);

  await app.init();

  return app as NestApplication;
}
