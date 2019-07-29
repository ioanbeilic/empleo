import { HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { tokenFromEncodedToken } from 'empleo-nestjs-authentication';
import { AppWrapper, clean, close, getAdminToken, getCandidateToken, init } from 'empleo-nestjs-testing';
import { additionalDocumentationBuilder } from '../../src/builders/common/additional-documentation.builder';
import { educationCreateBuilder } from '../../src/builders/educations/education-create.builder';
import { CvModule } from '../../src/cv.module';
import { Education } from '../../src/entities/education.entity';
import { api } from '../api/api';
import { removeEducationByToken } from '../api/educations.api';

describe('EducationController (POST) (e2e)', () => {
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

  describe(':keycloakId/educations', () => {
    it('should return 201 - Created', async () => {
      const education = await createEducation();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created without documentation', async () => {
      const educationWithoutAdditionalDocumentation = educationCreateBuilder()
        .withoutAdditionalDocumentation()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: educationWithoutAdditionalDocumentation })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 201 - Created when the "endDate" is null', async () => {
      const educationWithoutEndDate = educationCreateBuilder()
        .withoutEndDate()
        .withValidData()
        .build();

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: educationWithoutEndDate })
        .expectJson(HttpStatus.CREATED);
    });

    it('should return 400 - Bad Request when the "centerType" is invalid', async () => {
      const education = await createEducation();

      education.centerType = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "country" is invalid', async () => {
      const education = await createEducation();

      education.country = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "centerName" is invalid', async () => {
      const education = await createEducation();

      education.country = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "title" is invalid', async () => {
      const education = await createEducation();

      education.title = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "category" is invalid', async () => {
      const education = await createEducation();

      education.category = '';

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "startDate" is invalid', async () => {
      const education = await createEducation();

      education.startDate = 'this is an invalid date' as any;

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 - Bad Request when the "documentation.name" is empty', async () => {
      const education = await createEducation();

      const documentation = additionalDocumentationBuilder()
        .withValidData()
        .withName('')
        .build();

      education.documentation = [documentation];

      await api(app, { token: candidateToken })
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 - Unauthorized when user is not logged in', async () => {
      const education = await createEducation();

      await api(app)
        .educations({ keycloakId: candidateKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 - Forbidden when the user is not a candidate', async () => {
      const education = await createEducation();

      await api(app, { token: adminToken })
        .educations({ keycloakId: adminKeycloakId })
        .create({ payload: education })
        .expectJson(HttpStatus.FORBIDDEN);
    });
  });

  async function createEducation() {
    const education = educationCreateBuilder()
      .withValidData()
      .build();

    const createdEducation = await api(app, { token: candidateToken })
      .educations({ keycloakId: candidateKeycloakId })
      .create({ payload: education })
      .expectJson(HttpStatus.CREATED)
      .body();

    return plainToClass(Education, createdEducation, { enableImplicitConversion: true });
  }
});
