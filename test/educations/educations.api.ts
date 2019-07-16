import { NestApplication } from '@nestjs/core';
import Bluebird from 'bluebird';
import { Token } from 'empleo-nestjs-authentication';
import { getRepository } from 'typeorm';
import { EducationCreate } from '../../src/dto/education-create.dto';
import { Api } from '../../src/empleo-testing';
import { Education } from '../../src/entities/education.entity';

export class EducationsApi extends Api<Education, EducationCreate> {
  constructor({ app, token }: { app: NestApplication; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: '/educations',
      token
    });
  }
}

export function api(app: NestApplication, { token }: { token?: string } = {}) {
  return {
    educations() {
      return new EducationsApi({ app, token });
    }
  };
}

export async function removeEducationByToken(...tokens: string[]) {
  const educationRepository = getRepository(Education, 'educations');

  await Bluebird.resolve(tokens)
    .map(token => Token.fromEncoded(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => educationRepository.delete({ keycloakId }));
}

export async function removeEducationById(educationId: string) {
  const educationRepository = getRepository(Education, 'educations');
  return educationRepository.delete(educationId);
}
