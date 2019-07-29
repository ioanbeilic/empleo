import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { documentationBuilder } from '../../src/builders/documentations/documentations.builder';
import { CvModule } from '../../src/cv.module';
import { Documentation } from '../../src/entities/documentation.entity';
import { api } from '../api/api';
import { removeDocumentationByToken } from './documentations.api';

describe('DocumentationsController (POST) (e2e)', () => {
  const app = new AppWrapper(CvModule);

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
    await removeDocumentationByToken(adminToken, candidateToken);
  });

  beforeEach(clean(app));

  afterEach(async () => {
    await removeDocumentationByToken(adminToken, candidateToken);
  });

  after(clean(app));
  after(close(app));

  describe(':keycloakId/documentations', () => {
    it('should return 201 - Created', async () => {
      const documentation = await createDocumentation();

      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .create({ payload: documentation })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created when the "url" is null', async () => {
      const documentation = await createDocumentation();

      documentation.url = null;

      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .create({ payload: documentation })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "name" is invalid', async () => {
      const documentation = await createDocumentation();
      documentation.name = '';

      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .create({ payload: documentation })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "url" is invalid', async () => {
      const documentation = await createDocumentation();

      documentation.url = '';

      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .create({ payload: documentation })
        .expectJson(HttpStatus.BAD_REQUEST);
    });
  });

  async function createDocumentation() {
    const documentation = documentationBuilder()
      .withValidData()
      .build();

    const createdDocumentation = await api(app, { token: candidateToken })
      .documentations({ keycloakId: candidateKeycloakId })
      .create({ payload: documentation })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Documentation, createdDocumentation);
  }
});
