import { HttpStatus } from '@nestjs/common';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { additionalDocumentBuilder } from '../../src/builders/common/additional-document.builder';
import { experienceCreateBuilder } from '../../src/builders/experiences/experience-create.builder';
import { CvModule } from '../../src/cv.module';
import { api } from '../api/api';
import { removeExperienceByToken } from '../api/experiences.api';

describe('ExperiencesController (POST) (e2e)', () => {
  const app = new AppWrapper(CvModule);

  let candidateToken: string;
  let adminToken: string;
  let adminKeycloakId: string;
  let candidateKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    adminKeycloakId = tokenFromEncodedToken(adminToken).keycloakId;
    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;

    await removeExperienceByToken(adminToken, candidateToken);
  });

  afterEach(async () => {
    await removeExperienceByToken(adminToken, candidateToken);
  });

  after(clean(app));
  after(close(app));

  describe(':keycloakId/experiences', () => {
    it('should return 201 - Created', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without document', async () => {
      const experiencesWithoutAdditionalDocument = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experiencesWithoutAdditionalDocument })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without  "endDate"', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .withoutEndDate()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "companyName" is invalid', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .withoutCompanyName()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "description" is invalid', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .withoutDescription()
        .build();

      experience.description = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "position" is invalid', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .withoutPosition()
        .build();

      experience.position = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .withoutTitle()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "document.name" is empty', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .withAdditionalDocument(
          additionalDocumentBuilder()
            .withValidData()
            .withName('')
            .build()
        )
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .build();

      await api(app)
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const experience = experienceCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .experiences({ keycloakId: adminKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.FORBIDDEN);
    });
  });
});
