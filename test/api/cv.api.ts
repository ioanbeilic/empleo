import { NestApplication } from '@nestjs/core';
import Bluebird from 'bluebird';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { Api, TypedTest } from 'empleo-nestjs-testing';
import { getRepository } from 'typeorm';
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

export async function removeCvByToken(...tokens: string[]) {
  const cvRepository = getRepository(Cv);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => cvRepository.delete({ keycloakId }));
}

export async function removeCvById(cvId: string) {
  const cvRepository = getRepository(Cv);
  return cvRepository.delete(cvId);
}

export async function removeEducationByToken(...tokens: string[]) {
  const educationRepository = getRepository(Education);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => educationRepository.delete({ keycloakId }));
}
