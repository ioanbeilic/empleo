import { NestApplication } from '@nestjs/core';
import Bluebird from 'bluebird';
import { Token } from 'empleo-nestjs-authentication';
import { Api } from 'empleo-nestjs-testing';
import { getRepository } from 'typeorm';
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

export function api(app: NestApplication, path: string, { token }: { token?: string } = {}) {
  return {
    educations() {
      return new EducationsApi({ app, token, path });
    }
  };
}

export async function getUserByToken(token: string) {
  return Token.fromEncoded(token).keycloakId;
}

export async function removeEducationByToken(...tokens: string[]) {
  const educationRepository = getRepository(Education);

  await Bluebird.resolve(tokens)
    .map(token => Token.fromEncoded(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => educationRepository.delete({ keycloakId }));
}

export async function removeEducationById(educationId: string) {
  const educationRepository = getRepository(Education);
  return educationRepository.delete(educationId);
}
