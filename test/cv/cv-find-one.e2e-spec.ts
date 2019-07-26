import { HttpStatus } from '@nestjs/common';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { educationBuilder } from '../../src/builders/educations/education.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api, apiEducation, removeCvByToken, removeEducationByToken } from './cv.api';

describe('CvController (FIND) (e2e)', () => {
  const app = new AppWrapper(CvModule);

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;
  let adminKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    adminKeycloakId = tokenFromEncodedToken(adminToken).keycloakId;
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
  });

  beforeEach(clean(app));

  afterEach(async () => {
    await removeCvByToken(adminToken, candidateToken);
    await removeEducationByToken(adminToken, candidateToken);
  });

  after(clean(app));
  after(close(app));

  describe(':keycloakId/cv/', () => {
    it('should return 200 - ok', async () => {
      await createCv();
      await api(app, { token: candidateToken })
        .cv({ keycloakId: candidateKeycloakId })
        .findCvByKeycloakId()
        .expect(HttpStatus.OK);
    });

    it('should return 404 - NOT_FOUND when intent to find inexistent Cv', async () => {
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

  async function createCv() {
    let education: Education;

    education = educationBuilder()
      .withValidData()
      .withKeycloakId(candidateKeycloakId)
      .build();
    await apiEducation(app, { token: candidateToken })
      .educations({ keycloakId: candidateKeycloakId })
      .create({ payload: education })
      .expectJson(HttpStatus.CREATED);
  }
});
