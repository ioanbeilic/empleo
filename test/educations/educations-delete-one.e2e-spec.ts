import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { educationBuilder } from '../../src/builders/educations/education.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api } from '../api/api';
import { EducationTestSeed } from '../seeds/educations-test.seed';

describe('EducationController (DELETE) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [EducationTestSeed] });

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

  afterEach(clean(app, [EducationTestSeed]));

  after(clean(app));
  after(close(app));

  describe(':keycloakId/educations/:educationsId', () => {
    it('should return 204 - No Content', async () => {
      const education = await createEducation();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "educationId" is invalid', async () => {
      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const education = await createEducation();

      await api(app)
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const education = await createEducation();

      await api(app, { token: adminToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the "educationId" is not a valid uuid', async () => {
      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 - Not Found when the url keycloakId not belong to logged user', async () => {
      const education = await createEducation();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: adminKeycloakId })
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.NOT_FOUND);
    });

    describe('when the education does not belong to the user', () => {
      let education: Education;

      beforeEach(async () => {
        education = educationBuilder()
          .withValidData()
          .build();

        education.keycloakId = faker.random.uuid();

        await getRepository(Education).create(education);
      });

      afterEach(async () => {
        await getRepository(Education).remove(education);
      });

      it('should return 404 - Not Found when the education does not belong to the user', async () => {
        await api(app, { token: candidateToken })
          .educations({ keycloakId: candidateKeycloakId })
          .removeOne({ identifier: education.educationId })
          .expectJson(HttpStatus.NOT_FOUND);
      });
    });
  });

  async function createEducation() {
    const education = educationBuilder()
      .withValidData()
      .build();

    const createdEducation = await api(app, { token: candidateToken })
      .educations({ keycloakId: candidateKeycloakId })
      .create({ payload: education })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Education, createdEducation);
  }
});
