import { NestApplication } from '@nestjs/core';
import Bluebird from 'bluebird';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { Api, AppWrapper } from 'empleo-nestjs-testing';
import { getRepository } from 'typeorm';
import { DocumentationCreate } from '../../src/dto/documentation-create.dto';
import { Documentation } from '../../src/entities/documentation.entity';

export class DocumentationsApi extends Api<Documentation, DocumentationCreate> {
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
    documentations({ keycloakId }: { keycloakId: string }) {
      return new DocumentationsApi({ app, token, path: `/${keycloakId}/documentations` });
    }
  };
}

export async function removeDocumentationByToken(...tokens: string[]) {
  const documentationRepository = getRepository(Documentation);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => documentationRepository.delete({ keycloakId }));
}

export async function removeDocumentationById(documentationId: string) {
  const documentationRepository = getRepository(Documentation);
  return documentationRepository.delete(documentationId);
}
