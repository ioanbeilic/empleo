import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { languageCreateBuilder } from '../../src/builders/languages/language-create.builder';
import { languageBuilder } from '../../src/builders/languages/language.builder';
import { CvModule } from '../../src/cv.module';
import { Language } from '../../src/entities/language.entity';
import { api } from '../api/api';
import { removeLanguageByToken } from '../api/languages.api';

describe('LanguageController (PUT) (e2e)', () => {
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

  describe(':keycloakId/languages/:languagesId', () => {
    it('should return 204 - No Content', async () => {
      const language = await createLanguage();

      const languageUpdate = await languageCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: language.languageId, payload: languageUpdate })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "language" is null', async () => {
      const language = await createLanguage();

      language.language = '';

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: language.languageId, payload: language })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "level" is invalid', async () => {
      const language = await createLanguage();

      language.level = 6;

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: language.languageId, payload: language })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when the user is not logged in', async () => {
      const language = await createLanguage();

      const languageUpdate = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app)
        .languages({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: language.languageId, payload: languageUpdate })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const language = await createLanguage();

      const languageUpdate = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .languages({ keycloakId: adminKeycloakId })
        .overrideOne({ identifier: language.languageId, payload: languageUpdate })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the language does not exist', async () => {
      const languageUpdate = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: faker.random.uuid(), payload: languageUpdate })
        .expectJson(HttpStatus.NOT_FOUND);
    });

    describe('when the language does not belong to the user', () => {
      let language: Language;

      beforeEach(async () => {
        language = languageBuilder()
          .withValidData()
          .build();

        language.keycloakId = faker.random.uuid();

        await getRepository(Language).create(language);
      });

      afterEach(async () => {
        await getRepository(Language).remove(language);
      });

      it('should return 404 - Not Found when the language does not belong to the user', async () => {
        const languageUpdate = languageCreateBuilder()
          .withValidData()
          .build();

        await api(app, { token: candidateToken })
          .languages({ keycloakId: candidateKeycloakId })
          .overrideOne({ identifier: language.languageId, payload: languageUpdate })
          .expectJson(HttpStatus.NOT_FOUND);
      });
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
