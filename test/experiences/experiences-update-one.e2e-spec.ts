import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { additionalDocumentBuilder } from '../../src/builders/common/additional-document.builder';
import { experienceCreateBuilder } from '../../src/builders/experiences/experience-create.builder';
import { experienceBuilder } from '../../src/builders/experiences/experience.builder';
import { CvModule } from '../../src/cv.module';
import { Experience } from '../../src/entities/experience.entity';
import { api } from '../api/api';
import { removeExperienceByToken } from '../api/experiences.api';

describe('ExperienceController (PUT) (e2e)', () => {
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

  describe(':keycloakId/experiences/:experiencesId', () => {
    it('should return 204 - No Content', async () => {
      const experience = await createExperience();

      const experienceUpdate = await experienceCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 204 - No Content without document', async () => {
      const experience = await createExperience();

      const experienceWithoutAdditionalDocument = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceWithoutAdditionalDocument })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 204 - No Content when the "endDate" is null', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutEndDate()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "companyName" is invalid', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      experienceUpdate.companyName = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "description" is invalid', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      experienceUpdate.description = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "position" is invalid', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      experienceUpdate.position = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      experienceUpdate.title = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "document.name" is empty', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      const document = additionalDocumentBuilder()
        .withValidData()
        .withName('')
        .build();

      experienceUpdate.documents = [document];

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when the user is not logged in', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app)
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const experience = await createExperience();

      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .experiences({ keycloakId: adminKeycloakId })
        .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the experience does not exist', async () => {
      const experienceUpdate = experienceCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: faker.random.uuid(), payload: experienceUpdate })
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

      it('should return 404 - Not Found when the experience does not belong to the user', async () => {
        const experienceUpdate = experienceCreateBuilder()
          .withoutAdditionalDocument()
          .withValidData()
          .build();

        await api(app, { token: candidateToken })
          .experiences({ keycloakId: candidateKeycloakId })
          .overrideOne({ identifier: experience.experienceId, payload: experienceUpdate })
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
