import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { Token } from 'empleo-nestjs-authentication';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import { documentationBuilder } from '../../src/builders/common/documentation.builder';
import { experienceCreateBuilder } from '../../src/builders/experiences/experience-create.builder';
import { experienceBuilder } from '../../src/builders/experiences/experience.builder';
import { CvModule } from '../../src/cv.module';
import { Experience } from '../../src/entities/experience.entity';
import { api, removeExperienceByToken } from './experiences.api';

describe('ExperiencesController (POST) (e2e)', () => {
  let app: NestApplication;
  let candidateToken: string;
  let adminToken: string;
  let adminKeycloakId: string;
  let candidateKeycloakId: string;

  before(async () => {
    app = await startTestApp(CvModule);
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    adminKeycloakId = Token.fromEncoded(adminToken).keycloakId;
    candidateKeycloakId = Token.fromEncoded(candidateToken).keycloakId;

    await removeExperienceByToken(adminToken, candidateToken);
  });

  afterEach(async () => {
    await removeExperienceByToken(adminToken, candidateToken);
  });

  after(async () => {
    await removeExperienceByToken(adminToken, candidateToken);
    await app.close();
  });

  describe(':keycloakId/experiences', () => {
    it('should return 201 - Created', async () => {
      const experience = await createExperience();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without documentation', async () => {
      const experiencesWithoutDocumentation = experienceCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experiencesWithoutDocumentation })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without  "endDate"', async () => {
      const experience = await createExperience();

      delete experience.endDate;

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "companyName" is invalid', async () => {
      const experience = await createExperience();
      experience.companyName = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "description" is invalid', async () => {
      const experience = await createExperience();

      experience.description = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "position" is invalid', async () => {
      const experience = await createExperience();

      experience.position = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const experience = await createExperience();

      experience.title = '';

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "documentation.name" is empty', async () => {
      const experience = experienceBuilder()
        .withValidData()
        .build();

      const documentation = documentationBuilder()
        .withValidData()
        .withName('')
        .build();

      experience.documentation = [documentation];

      await api(app, { token: candidateToken })
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const experience = experienceBuilder()
        .withValidData()
        .build();

      await api(app)
        .experiences({ keycloakId: candidateKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const experience = experienceBuilder()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .experiences({ keycloakId: adminKeycloakId })
        .create({ payload: experience })
        .expectJson(HttpStatus.FORBIDDEN);
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
