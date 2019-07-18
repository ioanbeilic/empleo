import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { CheckUserService } from '../../services/common/check-user.service';
import { EducationsService } from '../../services/educations/educations.service';
import { EducationsController } from './educations.controller';

describe('EducationsController', () => {
  let mockedEducationsService: EducationsService;
  let mockedCheckUserService: CheckUserService;
  let educationsController: EducationsController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const user2 = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const educationCreate = educationCreateBuilder()
    .withValidData()
    .build();

  const education = educationBuilder()
    .withValidData()
    .build();

  const createdEducation = educationBuilder()
    .hydrate(education)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedEducationsService = mock(EducationsService);
    mockedCheckUserService = mock(CheckUserService);
    educationsController = new EducationsController(instance(mockedEducationsService), instance(mockedCheckUserService));
  });

  describe('#createEducation()', () => {
    it('should create a education', async () => {
      when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

      const responseEducation = await educationsController.createEducation(user, { keycloakId: user.id }, educationCreate);

      verify(mockedEducationsService.createEducation(objectContaining({ user, education: educationCreate }))).once();
      expect(responseEducation).to.be.equal(createdEducation);
    });

    it("not found exception if user don't have permission and is not admin", async () => {
      when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

      when(mockedCheckUserService.checkParam(anything())).thenThrow(new EducationNotFoundException());

      await expect(educationsController.createEducation(user, { keycloakId: user2.id }, education)).to.eventually.be.rejectedWith(
        EducationNotFoundException
      );

      verify(mockedCheckUserService.checkParam(objectContaining({ user, param: user2.id }))).once();

      verify(mockedEducationsService.createEducation({ user, education: educationCreate })).never();
    });
  });
});
