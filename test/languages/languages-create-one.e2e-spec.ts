import { HttpStatus } from '@nestjs/common';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { languageCreateBuilder } from '../../src/builders/languages/language-create.builder';
import { CvModule } from '../../src/cv.module';
import { api } from '../api/api';
import { removeLanguageByToken } from '../api/languages.api';
import { LanguageTestSeed } from '../seeds/languages-test.seed';

describe('LanguagesController (POST) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [LanguageTestSeed] });

  let candidateToken: string;
  let adminToken: string;
  let adminKeycloakId: string;
  let candidateKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    adminKeycloakId = tokenFromEncodedToken(adminToken).keycloakId;
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;

    await removeLanguageByToken(adminToken, candidateToken);
  });

  beforeEach(clean(app));

  after(clean(app));
  after(close(app));

  describe(':keycloakId/languages', () => {
    it('should return 201 - Created', async () => {
      const language = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "language" is not valid', async () => {
      const language = languageCreateBuilder()
        .withValidData()
        .withoutLanguage()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "level" is not valid', async () => {
      const language = languageCreateBuilder()
        .withValidData()
        .withoutLevel()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const language = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app)
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const language = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .languages({ keycloakId: adminKeycloakId })
        .create({ payload: language })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when a non admin is trying to add a language to a CV from another user', async () => {
      const language = languageCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .languages({ keycloakId: faker.random.uuid() })
        .create({ payload: language })
        .expectJson(HttpStatus.NOT_FOUND);
    });
  });
});
