import { NestApplication } from '@nestjs/core';
import { Api } from 'empleo-nestjs-testing';
import { ExperienceCreate } from '../../src/dto/experience-create.dto';
import { Experience } from '../../src/entities/experience.entity';

export class ExperiencesApi extends Api<Experience, ExperienceCreate> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }
}
