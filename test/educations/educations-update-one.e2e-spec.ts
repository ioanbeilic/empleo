import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import faker from 'faker';
import { getRepository } from 'typeorm';
import { additionalDocumentBuilder } from '../../src/builders/common/additional-document.builder';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { educationBuilder } from '../../src/builders/educations/education.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api } from '../api/api';
import { removeEducationByToken } from '../api/educations.api';

describe('EducationController (PUT) (e2e)', () => {
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

    await removeEducationByToken(adminToken, candidateToken);
  });

  afterEach(async () => {
    await removeEducationByToken(adminToken, candidateToken);
  });

  after(clean(app));
  after(close(app));

  describe(':keycloakId/educations/:educationsId', () => {
    it('should return 204 - No Content', async () => {
      const education = await createEducation();

      const educationUpdate = await educationCreateBuilder()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 204 - No Content without document', async () => {
      const education = await createEducation();

      const educationWithoutAdditionalDocument = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationWithoutAdditionalDocument })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app)
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 - Bad Request when the "centerType" is invalid', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      educationUpdate.centerType = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "country" is invalid', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      educationUpdate.country = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "centerName" is invalid', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      educationUpdate.country = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      educationUpdate.title = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "category" is invalid', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      educationUpdate.category = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 204 - No Content when the "endDate" is null', async () => {
      const education = await createEducation();

      const educationWithoutEndDate = educationCreateBuilder()
        .withoutEndDate()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationWithoutEndDate })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 - Bad Request when the "document.name" is empty', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      const document = additionalDocumentBuilder()
        .withValidData()
        .withName('')
        .build();

      educationUpdate.documents = [document];

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when the user is not logged in', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app)
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      const education = await createEducation();

      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: adminToken })
        .educations({ keycloakId: adminKeycloakId })
        .overrideOne({ identifier: education.educationId, payload: educationUpdate })
        .expectJson(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the education does not exist', async () => {
      const educationUpdate = educationCreateBuilder()
        .withoutAdditionalDocument()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .overrideOne({ identifier: faker.random.uuid(), payload: educationUpdate })
        .expectJson(HttpStatus.NOT_FOUND);
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
        const educationUpdate = educationCreateBuilder()
          .withoutAdditionalDocument()
          .withValidData()
          .build();

        await api(app, { token: candidateToken })
          .educations({ keycloakId: candidateKeycloakId })
          .overrideOne({ identifier: education.educationId, payload: educationUpdate })
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
