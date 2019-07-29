import { NestApplication } from '@nestjs/core';
import Bluebird from 'bluebird';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { Api, AppWrapper } from 'empleo-nestjs-testing';
import { getRepository } from 'typeorm';
import { LanguageCreate } from '../../src/dto/language-create.dto';
import { Language } from '../../src/entities/language.entity';

export class LanguagesApi extends Api<Language, LanguageCreate> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }
}

export function api({ app }: AppWrapper, { token }: { token?: string } = {}) {
  return {
    languages({ keycloakId }: { keycloakId: string }) {
      return new LanguagesApi({ app, token, path: `/${keycloakId}/languages` });
    }
  };
}

export async function removeLanguageByToken(...tokens: string[]) {
  const languageRepository = getRepository(Language);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => languageRepository.delete({ keycloakId }));
}

export async function removeLanguageById(languageId: string) {
  const languageRepository = getRepository(Language);
  return languageRepository.delete(languageId);
}
