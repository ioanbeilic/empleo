import { NestApplication } from '@nestjs/core';
import Bluebird from 'bluebird';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { Api } from 'empleo-nestjs-testing';
import { getRepository } from 'typeorm';
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

export function api(app: NestApplication, { token }: { token?: string } = {}) {
  return {
    experiences({ keycloakId }: { keycloakId: string }) {
      return new ExperiencesApi({ app, token, path: `/${keycloakId}/experiences` });
    }
  };
}

export async function removeExperienceByToken(...tokens: string[]) {
  const experienceRepository = getRepository(Experience);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => experienceRepository.delete({ keycloakId }));
}

export async function removeExperienceById(experienceId: string) {
  const experienceRepository = getRepository(Experience);
  return experienceRepository.delete(experienceId);
}
