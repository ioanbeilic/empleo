import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { experienceBuilder } from '../../src/builders/experiences/experience.builder';
import { CvModule } from '../../src/cv.module';
import { Experience } from '../../src/entities/experience.entity';
import { api } from '../api/api';
import { removeExperienceByToken } from '../api/experiences.api';
import { ExperienceTestSeed } from '../seeds/experiences-test.seed';

describe('ExperienceController (DELETE) (e2e)', () => {
  const app = new AppWrapper(CvModule, { providers: [ExperienceTestSeed] });

  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;

  before(init(app));

  before(async () => {
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    candidateKeycloakId = tokenFromEncodedToken(candidateToken).keycloakId;

    await removeExperienceByToken(adminToken, candidateToken);
  });

  afterEach(clean(app, [ExperienceTestSeed]));

  after(clean(app));
  after(close(app));

  describe(':keycloakId/experiences/:experiencesId', () => {
    it('should return 204 - No Content', async () => {
      const experience = await createExperience();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: experience.experienceId })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "experienceId" is not an uuid', async () => {
      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const experience = await createExperience();

      await api(app)
        .experiences({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: experience.experienceId })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const experience = await createExperience();

      await api(app, { token: adminToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: experience.experienceId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the experience does not exist', async () => {
      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: faker.random.uuid() })
        .expectJson(HttpStatus.NOT_FOUND);
    });

    describe('when the experience does not belong to the user', () => {
      let experience: Experience;

      beforeEach(async () => {
        experience = experienceBuilder()
          .withValidData()
          .build();

        experience.keycloakId = faker.random.uuid();

        await getRepository(Experience).create(experience);
      });

      afterEach(async () => {
        await getRepository(Experience).remove(experience);
      });

      it('should return 404 - Not Found', async () => {
        await api(app, { token: candidateToken })
          .experiences({ keycloakId: candidateKeycloakId })
          .removeOne({ identifier: experience.experienceId })
          .expectJson(HttpStatus.NOT_FOUND);
      });
    });
  });

  async function createExperience() {
    const experience = experienceBuilder()
      .withValidData()
      .build();

    const createdExperience = await api(app, { token: candidateToken })
      .experiences({ keycloakId: candidateKeycloakId })
      .create({ payload: experience })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Experience, createdExperience);
  }
});
