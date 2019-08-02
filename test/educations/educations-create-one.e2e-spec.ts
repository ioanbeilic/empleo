import { HttpStatus } from '@nestjs/common';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { additionalDocumentBuilder } from '../../src/builders/common/additional-document.builder';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { CvModule } from '../../src/cv.module';
import { api } from '../api/api';
import { CvTestSeed } from '../seeds/cv-test.seed';

describe('EducationController (POST) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [CvTestSeed] });

  let candidateToken: string;
  let adminToken: string;
  let adminKeycloakId: string;
  let candidateKeycloakId: string;

  before(init(app));
  before(clean(app, [CvTestSeed]));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    adminKeycloakId = tokenFromEncodedToken(adminToken).keycloakId;
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;
  });

  afterEach(clean(app, [CvTestSeed]));
  after(close(app));

  describe(':keycloakId/educations', () => {
    it('should return 201 - Created', async () => {
      const education = await educationCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without document', async () => {
      const educationWithoutAdditionalDocument = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: educationWithoutAdditionalDocument })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created when the "endDate" is null', async () => {
      const educationWithoutEndDate = educationCreateBuilder()
        .withoutEndDate()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: educationWithoutEndDate })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "centerType" is invalid', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withoutCenterType()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "country" is invalid', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withoutCountry()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "centerName" is invalid', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withoutCenterName()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withoutTitle()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "category" is invalid', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withoutCategory()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "startDate" is invalid', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withoutStartDate()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "document.name" is empty', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .withAdditionalDocument(
          additionalDocumentBuilder()
            .withValidData()
            .withName('')
            .build()
        )
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .build();

      await api(app)
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .educations({ keycloakId: adminKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.FORBIDDEN);
    });
  });
});
