import { HttpStatus } from '@nestjs/common';
import { expect } from 'chai';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { documentCreateBuilder } from '../../src/builders/document/document-create.builder';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { experienceCreateBuilder } from '../../src/builders/experiences/experience-create.builder';
import { languageCreateBuilder } from '../../src/builders/languages/language-create.builder';
import { CvModule } from '../../src/cv.module';
import { Cv } from '../../src/entities/cv.entity';
import { api } from '../api/api';
import { CvTestSeed } from '../seeds/cv-test.seed';

describe('CvController (GET) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [CvTestSeed] });

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;
  let adminKeycloakId: string;

  before(init(app));
  before(clean(app, [CvTestSeed]));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    adminKeycloakId = tokenFromEncodedToken(adminToken).keycloakId;
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
  });

  afterEach(clean(app, [CvTestSeed]));
  after(close(app));

  describe(':keycloakId/cv', () => {
    it('should return 200 - Ok', async () => {
      const cvInfo = await createCv();

      const cv = await api(app, { token: candidateToken })
        .cv({ keycloakId: candidateKeycloakId })
        .findCvByKeycloakId()
        .expect(HttpStatus.OK)
        .body();

      expect(cv).to.containSubset(cvInfo);
    });

    it('should return 404 - Not Found when the CV does not exist', async () => {
      await api(app, { token: candidateToken })
        .cv({ keycloakId: candidateKeycloakId })
        .findOne({ identifier: candidateKeycloakId })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      await createCv();
      await api(app)
        .cv({ keycloakId: candidateKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      await createCv();

      await api(app, { token: adminToken })
        .cv({ keycloakId: candidateKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the url keycloakId not belong to logged user', async () => {
      await createCv();
      await api(app, { token: candidateToken })
        .cv({ keycloakId: adminKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  async function createCv(): Promise<Partial<Cv>> {
    const educationCreate = educationCreateBuilder()
      .withValidData()
      .build();

    const experienceCreate = experienceCreateBuilder()
      .withValidData()
      .build();

    const languageCreate = languageCreateBuilder()
      .withValidData()
      .build();

    const documentCreate = documentCreateBuilder()
      .withValidData()
      .build();

    const [education, experience, language, document] = await Promise.all([
      api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: educationCreate })
        .expectJson(HttpStatus.CREATED)
        .body(),
      api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experienceCreate })
        .expectJson(HttpStatus.CREATED)
        .body(),
      api(app, { token: candidateToken })
        .languages({ keycloakId: candidateKeycloakId })
        .create({ payload: languageCreate })
        .expectJson(HttpStatus.CREATED)
        .body(),
      api(app, { token: candidateToken })
        .documents({ keycloakId: candidateKeycloakId })
        .create({ payload: documentCreate })
        .expectJson(HttpStatus.CREATED)
        .body()
    ]);

    return {
      educations: [education],
      experiences: [experience],
      languages: [language],
      documents: [document]
    };
  }
});
