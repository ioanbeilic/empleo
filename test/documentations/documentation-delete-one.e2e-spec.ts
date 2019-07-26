import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { documentationBuilder } from '../../src/builders/documentations/documentations.builder';
import { CvModule } from '../../src/cv.module';
import { Documentation } from '../../src/entities/documentation.entity';
import { api, removeDocumentationByToken } from './documentations.api';

describe('DocumentationController (DELETE) (e2e)', () => {
  let app: NestApplication;
  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;

  before(async () => {
    app = await startTestApp(CvModule);
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;

    await removeDocumentationByToken(adminToken, candidateToken);
  });

  afterEach(async () => {
    await removeDocumentationByToken(adminToken, candidateToken);
  });

  after(async () => {
    await removeDocumentationByToken(adminToken, candidateToken);
    await app.close();
  });

  describe(':keycloakId/documentations/:documentationsId', () => {
    it('should return 204 - No Content', async () => {
      const documentation = await createDocumentation();

      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: documentation.documentationId })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "documentationId" is not an uuid', async () => {
      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const documentation = await createDocumentation();

      await api(app)
        .documentations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: documentation.documentationId })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const documentation = await createDocumentation();

      await api(app, { token: adminToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: documentation.documentationId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the documentation does not exist', async () => {
      await api(app, { token: candidateToken })
        .documentations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: faker.random.uuid() })
        .expectJson(HttpStatus.NOT_FOUND);
    });

    describe('when the documentation does not belong to the user', () => {
      let documentation: Documentation;

      beforeEach(async () => {
        documentation = documentationBuilder()
          .withValidData()
          .build();

        documentation.keycloakId = faker.random.uuid();

        await getRepository(Documentation).create(documentation);
      });

      afterEach(async () => {
        await getRepository(Documentation).remove(documentation);
      });

      it('should return 404 - Not Found', async () => {
        await api(app, { token: candidateToken })
          .documentations({ keycloakId: candidateKeycloakId })
          .removeOne({ identifier: documentation.documentationId })
          .expectJson(HttpStatus.NOT_FOUND);
      });
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
