import Bluebird from 'bluebird';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { getRepository } from 'typeorm';
import { Document } from '../../src/entities/document.entity';

export async function removeDocumentByToken(...tokens: string[]) {
  const documentRepository = getRepository(Document);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => documentRepository.delete({ keycloakId }));
}
