import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { languageBuilder } from '../../src/builders/languages/language.builder';
import { CvModule } from '../../src/cv.module';
import { Language } from '../../src/entities/language.entity';
import { api } from '../api/api';
import { CvTestSeed } from '../seeds/cv-test.seed';

describe('LanguageController (DELETE) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [CvTestSeed] });

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;

  before(init(app));
  before(clean(app, [CvTestSeed]));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
  });

  afterEach(clean(app, [CvTestSeed]));
  after(close(app));

  describe(':keycloakId/languages/:languagesId', () => {
    it('should return 204 - No Content', async () => {
      const language = await createLanguage();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: language.languageId })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "languageId" is not an uuid', async () => {
      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const language = await createLanguage();

      await api(app)
        .languages({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: language.languageId })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const language = await createLanguage();

      await api(app, { token: adminToken })
        .languages({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: language.languageId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the language does not exist', async () => {
      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: faker.random.uuid() })
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

      it('should return 404 - Not Found', async () => {
        await api(app, { token: candidateToken })
          .languages({ keycloakId: candidateKeycloakId })
          .removeOne({ identifier: language.languageId })
          .expectJson(HttpStatus.NOT_FOUND);
      });
    });
  });

  async function createLanguage() {
    const language = languageBuilder()
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
