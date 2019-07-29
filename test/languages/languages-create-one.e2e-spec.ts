import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import faker from 'faker';
import { languageCreateBuilder } from '../../src/builders/languages/language-create.builder';
import { languageBuilder } from '../../src/builders/languages/language.builder';
import { CvModule } from '../../src/cv.module';
import { Language } from '../../src/entities/language.entity';
import { api } from '../api/api';
import { removeLanguageByToken } from '../api/languages.api';

describe('LanguagesController (POST) (e2e)', () => {
  let app: NestApplication;
  let candidateToken: string;
  let adminToken: string;
  let adminKeycloakId: string;
  let candidateKeycloakId: string;

  before(async () => {
    app = await startTestApp(CvModule);
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    adminKeycloakId = tokenFromEncodedToken(adminToken).keycloakId;
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;

    await removeLanguageByToken(adminToken, candidateToken);
  });

  afterEach(async () => {
    await removeLanguageByToken(adminToken, candidateToken);
  });

  after(async () => {
    await removeLanguageByToken(adminToken, candidateToken);
    await app.close();
  });

  describe(':keycloakId/languages', () => {
    it('should return 201 - Created', async () => {
      const language = await createLanguage();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "language" is not valid', async () => {
      const language = await createLanguage();

      language.language = '';

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "level" is not valid', async () => {
      const language = await createLanguage();

      language.level = 6;

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const language = languageBuilder()
        .withValidData()
        .build();

      await api(app)
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const language = languageBuilder()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .languages({ keycloakId: adminKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when a non admin is trying to add a language to a CV from another user', async () => {
      const language = languageBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: faker.random.uuid() })
        .create({ payload: language })
        .expectJson(HttpStatus.NOT_FOUND);
    });
  });

  async function createLanguage() {
    const language = languageCreateBuilder()
      .withValidData()
      .build();

    const createdLanguage = await api(app, { token: candidateToken })
      .languages({ keycloakId: candidateKeycloakId })
      .create({ payload: language })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Language, createdLanguage);
  }
});
