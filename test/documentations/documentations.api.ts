import Bluebird from 'bluebird';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { getRepository } from 'typeorm';
import { Documentation } from '../../src/entities/documentation.entity';

export async function removeDocumentationByToken(...tokens: string[]) {
  const documentationRepository = getRepository(Documentation);

  await Bluebird.resolve(tokens)
    .map(token => tokenFromEncodedToken(token))
    .map(({ keycloakId }) => keycloakId)
    .map(keycloakId => documentationRepository.delete({ keycloakId }));
}
