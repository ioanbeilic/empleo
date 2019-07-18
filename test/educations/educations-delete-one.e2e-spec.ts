import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import uuid from 'uuid/v4';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { CvModule } from '../../src/cv.module';
import { api, createToDb, getUserByToken, removeEducationById, removeEducationByToken } from './educations.api';

describe('EducationController (DELETE) (e2e)', () => {
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

      const newEducation = await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expect(HttpStatus.CREATED)
        .body();

      await api(app, path, { token: candidateToken })
        .educations()
        .removeOne({ identifier: newEducation.educationId })
        .expect(HttpStatus.OK);
    });

    it('should return 200 - OK', async () => {
      const educationWithoutDocumentation = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      const newEducation = await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: educationWithoutDocumentation })
        .expect(HttpStatus.CREATED)
        .body();

      await api(app, path, { token: candidateToken })
        .educations()
        .removeOne({ identifier: newEducation.educationId })
        .expect(HttpStatus.OK);
    });

    it('should return 403 - Forbidden  when user is admin', async () => {
      const education = educationCreateBuilder()
        .withValidData()
        .build();

      const newEducation = await api(app, path, { token: candidateToken })
        .educations()
        .create({ payload: education })
        .expect(HttpStatus.CREATED)
        .body();

      await api(app, path, { token: adminToken })
        .educations()
        .removeOne({ identifier: newEducation.educationId })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when user is not logged in', async () => {
      const education = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path)
        .educations()
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 - Bad Request when the "educationId" is invalid', async () => {
      await api(app, path, { token: candidateToken })
        .educations()
        .removeOne({ identifier: '123455' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 - Not Found when the "educationId" is null', async () => {
      await api(app, path, { token: candidateToken })
        .educations()
        .removeOne({ identifier: '' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 - Not Found when the education id is not the logged in user', async () => {
      // create a education with another user
      const education = await createToDb();

      // intent to delete a valid education from another user
      await api(app, path, { token: candidateToken })
        .educations()
        .removeOne({ identifier: education.educationId })
        .expect(HttpStatus.NOT_FOUND);

      // remove education created with createToDb() function
      removeEducationById(education.educationId);
    });

    it('should return 404 - Not Found when the education id not exist', async () => {
      // create a education with another user
      const education = await createToDb();

      // intent to delete a valid education from another user
      await api(app, path, { token: candidateToken })
        .educations()
        .removeOne({ identifier: uuid() })
        .expect(HttpStatus.NOT_FOUND);

      // remove education created with createToDb() function
      removeEducationById(education.educationId);
    });
  });
});
