import { HttpStatus } from '@nestjs/common';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { documentCreateBuilder } from '../../src/builders/document/document-create.builder';
import { CvModule } from '../../src/cv.module';
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
      const document = await documentCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created when the "url" is null', async () => {
      const document = documentCreateBuilder()
        .withValidData()
        .withUrl(null)
        .build();

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "name" is invalid', async () => {
      const document = documentCreateBuilder()
        .withValidData()
        .withoutName()
        .build();

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "url" is invalid', async () => {
      const document = documentCreateBuilder()
        .withValidData()
        .withUrl('')
        .build();

      await api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: document })
        .expectJson(HttpStatus.BAD_REQUEST);
    });
  });
});