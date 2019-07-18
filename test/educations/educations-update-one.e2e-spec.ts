import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import uuid from 'uuid/v4';
import { documentationBuilder } from '../../src/builders/educations/documentation.builder';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { educationBuilder } from '../../src/builders/educations/education.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api, createToDb, getUserByToken, removeEducationById, removeEducationByToken } from './educations.api';

describe('EducationController (PUT) (e2e)', () => {
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

  describe(':keycloakId/educations/:educationsId', () => {
    it('should return 204 - No Content', async () => {
      const education = await createEducation();

      const educationUpdate = await educationCreateBuilder()
        .withValidData()
        .build();

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 204 - No Content without documentation', async () => {
      const education = await createEducation();

      const educationWithoutDocumentation = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationWithoutDocumentation })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path)
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 - Bad Request when the "centerType" is invalid', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      educationUpdate.centerType = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "country" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      educationUpdate.country = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "centerName" is invalid', async () => {
      const education: Education = educationBuilder()
        .withValidData()
        .build();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      educationUpdate.country = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const education = educationBuilder()
        .withValidData()
        .build();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      educationUpdate.title = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "category" is invalid', async () => {
      const education: Education = educationBuilder()
        .withValidData()
        .build();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      educationUpdate.category = '';

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "documentation.name" is empty', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      const documentation = documentationBuilder()
        .withValidData()
        .withName('')
        .build();

      educationUpdate.documentation = [documentation];

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when the user is not logged in', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path)
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path, { token: adminToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the education does not belong to the user', async () => {
      // create a education with another user
      const education = await createToDb();

      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      // intent to update a valid education from another user
      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.NOT_FOUND);

      // remove education created with createToDb() function
      removeEducationById(education.educationId);
    });

    it('should return 404 - Not Found when the education does not exist', async () => {
      const educationUpdate = educationCreateBuilder()
        .withoutDocumentation()
        .withValidData()
        .build();

      await api(app, path, { token: candidateToken })
        .educations()
        .overrideOne({ identifier: uuid(), payload: educationUpdate })
        .expectJson(HttpStatus.NOT_FOUND);
    });
  });

  async function createEducation() {
    const education = educationBuilder()
      .withValidData()
      .build();

    const createdEducation = await api(app, path, { token: candidateToken })
      .educations()
      .create({ payload: education })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Education, createdEducation);
  }
});
