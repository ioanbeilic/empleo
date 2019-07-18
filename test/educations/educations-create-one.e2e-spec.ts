import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import { CvModule } from '../../src/cv.module';
import { documentationBuilder } from '../../src/modules/builders/educations/documentation.builder';
import { educationCreateBuilder } from '../../src/modules/builders/educations/education-create.builder';
import { educationBuilder } from '../../src/modules/builders/educations/education.builder';
import { api, getUserByToken, removeEducationByToken } from './educations.api';

describe('EducationController (POST) (e2e)', () => {
  let app: NestApplication;
  let candidateToken: string;
  let adminToken: string;
  let path: string;

  before(async () => {
    app = await startTestApp(CvModule);
    [adminToken, candidateToken] = await Promise.all([getAdminToken(), getCandidateToken()]);
    await removeEducationByToken(adminToken, candidateToken);
    path = `/${await getUserByToken(candidateToken)}/educations`;
  });

  afterEach(async () => {
    await removeEducationByToken(adminToken, candidateToken);
  });

  after(async () => {
    await removeEducationByToken(adminToken, candidateToken);
    await app.close();
  });

  describe(':keycloakId/educations', () => {
    it('should return 201 - Created', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without documentation', async () => {
      const educationWithoutDocumentation = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: educationWithoutDocumentation })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const education = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path, { token: adminToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      await api(app, path)
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 - Bad Request when the "centerType" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      education.centerType = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "country" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      education.country = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "centerName" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      education.country = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      education.title = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "category" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      education.category = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "documentation.name" is empty', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      const documentation = documentationBuilder()
        .withValidData()
        .withName('')
        .build();

      education.documentation = [documentation];

      await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      await api(app, path, { token: adminToken })
        .educations()
        .create({ payload: education })
        .expectJson(HttpStatus.FORBIDDEN);
    });
  });
});
