import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { Token } from 'empleo-nestjs-authentication';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import faker = require('faker');
import { getRepository } from 'typeorm';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { educationBuilder } from '../../src/builders/educations/education.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api, removeEducationByToken } from './educations.api';

describe('EducationController (DELETE) (e2e)', () => {
  let app: NestApplication;
  let candidateToken: string;
  let adminToken: string;
  let candidateKeycloakId: string;
  let adminKeycloakId: string;

  before(async () => {
    app = await startTestApp(CvModule);
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);

    adminKeycloakId = Token.fromEncoded(adminToken).keycloakId;
    candidateKeycloakId = Token.fromEncoded(candidateToken).keycloakId;

    await removeEducationByToken(adminToken, candidateToken);
  });

  afterEach(async () => {
    await removeEducationByToken(candidateToken, adminToken);
  });

  after(async () => {
    await removeEducationByToken(adminToken, candidateToken);
    await app.close();
  });

  describe(':keycloakId/educations/:educationsId', () => {
    it('should return 200 - OK', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .build();

      const newEducation = await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expect(HttpStatus.CREATED)
        .body();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: newEducation.educationId })
        .expect(HttpStatus.OK);
    });

    it('should return 200 - OK', async () => {
      const educationWithoutDocumentation = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      const newEducation = await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: educationWithoutDocumentation })
        .expect(HttpStatus.CREATED)
        .body();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: newEducation.educationId })
        .expect(HttpStatus.OK);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .build();

      const newEducation = await api(app, { token: candidateToken })
        .educations({ keycloakId: adminKeycloakId })
        .create({ payload: education })
        .expect(HttpStatus.CREATED)
        .body();

      await api(app, { token: adminToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: newEducation.educationId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when user is not logged in', async () => {
      const education = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app)
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 - Bad Request when the "educationId" is invalid', async () => {
      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 - Not Found when the "educationId" is null', async () => {
      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .removeOne({ identifier: '' })
        .expect(HttpStatus.NOT_FOUND);
    });

    describe('when the education does not belong to the user', () => {
      let education: Education;

      beforeEach(async () => {
        education = await createEducation();
        await getRepository(Education).update({ educationId: education.educationId }, { keycloakId: faker.random.uuid() });
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
