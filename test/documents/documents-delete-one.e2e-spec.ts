import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { documentBuilder } from '../../src/builders/document/document.builder';
import { CvModule } from '../../src/cv.module';
import { Document } from '../../src/entities/document.entity';
import { api } from '../api/api';
import { DocumentTestSeed } from '../seeds/documents-test.seed';

describe('DocumentController (DELETE) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [DocumentTestSeed] });

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
  });

  beforeEach(clean(app));

  after(clean(app));
  after(close(app));

  describe(':keycloakId/documents/:documentsId', () => {
    it('should return 204 - No Content', async () => {
      const document = await createDocument();

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: document.documentId })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "documentId" is not an uuid', async () => {
      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const document = await createDocument();

      await api(app)
        .documents({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: document.documentId })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const document = await createDocument();

      await api(app, { token: adminToken })
        .documents({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: document.documentId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the document does not exist', async () => {
      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: faker.random.uuid() })
        .expectJson(HttpStatus.NOT_FOUND);
    });

    describe('when the document does not belong to the user', () => {
      let document: Document;

      beforeEach(async () => {
        document = documentBuilder()
          .withValidData()
          .build();

        document.keycloakId = faker.random.uuid();

        await getRepository(Document).create(document);
      });

      afterEach(async () => {
        await getRepository(Document).remove(document);
      });

      it('should return 404 - Not Found', async () => {
        await api(app, { token: candidateToken })
          .documents({ keycloakId: candidateKeycloakId })
          .removeOne({ identifier: document.documentId })
          .expectJson(HttpStatus.NOT_FOUND);
      });
    });
  });

  async function createDocument() {
    const document = documentBuilder()
      .withValidData()
      .build();

    const createdDocument = await api(app, { token: candidateToken })
      .documents({ keycloakId: candidateKeycloakId })
      .create({ payload: document })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Document, createdDocument);
  }
});
