import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { Token } from 'empleo-nestjs-authentication';
import { getAdminToken, getCandidateToken, startTestApp } from 'empleo-nestjs-testing';
import { educationBuilder } from '../../src/builders/educations/education.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api, apiEducation, removeCvByToken, removeEducationByToken } from './cv.api';

describe('CvController (DELETE) (e2e)', () => {
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
  });

  afterEach(async () => {
    await removeCvByToken(adminToken, candidateToken);
  });

  after(async () => {
    await removeCvByToken(adminToken, candidateToken);
    await app.close();
  });

  describe(':keycloakId/cv/:cvId', () => {
    it('should return 204 - NO_CONTENT', async () => {
      await createCv();

      await api(app, { token: candidateToken })
        .cv({ keycloakId: candidateKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.NO_CONTENT);

      await api(app, { token: candidateToken })
        .cv({ keycloakId: candidateKeycloakId })
        .findOne({ identifier: candidateKeycloakId })
        .expect(HttpStatus.NOT_FOUND);
    });
    describe(' create a education, delete a cv and try to find the education', () => {
      let education: Education;

      before(async () => {
        education = await createCv();
      });

      after(async () => {
        await removeEducationByToken(candidateToken);
      });

      it('should return 404 - Not Found when try to get a education from a deleted Cv', async () => {
        await apiEducation(app, { token: candidateToken })
          .educations({ keycloakId: candidateKeycloakId })
          .create({ payload: education })
          .expectJson(HttpStatus.CREATED);

        await api(app, { token: candidateToken })
          .cv({ keycloakId: candidateKeycloakId })
          .removeWithKeycloakId()
          .expect(HttpStatus.NO_CONTENT);

        await api(app, { token: candidateToken })
          .cv({ keycloakId: candidateKeycloakId })
          .findOne({ identifier: candidateKeycloakId })
          .expect(HttpStatus.NOT_FOUND);

        await apiEducation(app, { token: candidateToken })
          .educations({ keycloakId: candidateKeycloakId })
          .findOne({ identifier: education.educationId })
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      await api(app)
        .cv({ keycloakId: candidateKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden  when user is not candidate', async () => {
      await api(app, { token: adminToken })
        .cv({ keycloakId: candidateKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 - Not Found when the url keycloakId not belong to logged user', async () => {
      await api(app, { token: candidateToken })
        .cv({ keycloakId: adminKeycloakId })
        .removeWithKeycloakId()
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  async function createCv() {
    let education: Education;

    education = educationBuilder()
      .withValidData()
      .build();

    const createdEducation = await apiEducation(app, { token: candidateToken })
      .educations({ keycloakId: candidateKeycloakId })
      .create({ payload: education })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Education, createdEducation);
  }
});
