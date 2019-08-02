import { NestApplication } from '@nestjs/core';
import { Api, TypedTest } from 'empleo-nestjs-testing';
import { Cv } from '../../src/entities/cv.entity';
import { Education } from '../../src/entities/education.entity';

export class CvApi extends Api<Cv, Education> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }

  removeWithKeycloakId(): TypedTest<void> {
    return this.delete(this.uri({ path: `/` }));
  }

  findCvByKeycloakId(): TypedTest<Cv> {
    return this.get(this.uri({ path: `/` }));
  }
}
