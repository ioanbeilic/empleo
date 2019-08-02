import { NestApplication } from '@nestjs/core';
import { Api } from 'empleo-nestjs-testing';
import { EducationCreate } from '../../src/dto/education-create.dto';
import { Education } from '../../src/entities/education.entity';

export class EducationsApi extends Api<Education, EducationCreate> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }
}
