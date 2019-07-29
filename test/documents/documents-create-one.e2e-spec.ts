import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { documentBuilder } from '../../src/builders/documents/documents.builder';
import { CvModule } from '../../src/cv.module';
import { Document } from '../../src/entities/document.entity';
import { api } from '../api/api';
import { removeDocumentByToken } from './documents.api';

describe('DocumentsController (POST) (e2e)', () => {
  const app = new AppWrapper(CvModule);

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
    await removeDocumentByToken(adminToken, candidateToken);
  });

  beforeEach(clean(app));

  afterEach(async () => {
    await removeDocumentByToken(adminToken, candidateToken);
  });

  after(clean(app));
  after(close(app));

  describe(':keycloakId/documents', () => {
    it('should return 201 - Created', async () => {
      const document = await createDocument();

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created when the "url" is null', async () => {
      const document = await createDocument();

      document.url = null;

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "name" is invalid', async () => {
      const document = await createDocument();
      document.name = '';

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "url" is invalid', async () => {
      const document = await createDocument();

      document.url = '';

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.BAD_REQUEST);
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
