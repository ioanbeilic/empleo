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

  const educationUpdate = educationCreateBuilder()
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

  describe('#updateOne()', () => {
    it('should update a education when it exists and belong to the user', async () => {
      const educationId = createdEducation.educationId;

      when(mockedEducationsService.updateOne(anything())).thenResolve();
      when(mockedEducationsService.findUserEducationById(anything())).thenResolve(createdEducation);

      const responseEducation = await educationsController.updateEducation(user, educationUpdate, { educationId });

      verify(mockedEducationsService.findUserEducationById(objectContaining({ educationId, user }))).calledBefore(
        mockedEducationsService.updateOne(
          objectContaining({
            education: createdEducation,
            update: educationUpdate
          })
        )
      );
      expect(responseEducation).to.be.undefined;
    });

    it('should throw an education not found exception when the education does not exist', async () => {
      const educationId = createdEducation.educationId;

      when(mockedEducationsService.updateOne(anything())).thenResolve();

      when(mockedEducationsService.findUserEducationById(anything())).thenReject(new EducationNotFoundException());

      await expect(educationsController.updateEducation(user, educationUpdate, { educationId })).to.eventually.be.rejectedWith(
        EducationNotFoundException
      );

      verify(mockedEducationsService.findUserEducationById(objectContaining({ educationId, user }))).once();
      verify(mockedEducationsService.updateOne(anything())).never();
    });
  });

  describe('#deleteOne()', () => {
    it('should correctly delete a education', async () => {
      const educationId = createdEducation.educationId;

      when(mockedEducationsService.deleteOne(anything())).thenResolve();

      const response = await educationsController.deleteOne(user, { educationId });

      verify(mockedEducationsService.deleteOne(objectContaining({ user, educationId }))).once();
      expect(response).to.be.undefined;
    });

    it('should throw an education not found exception when the education does not exist', async () => {
      when(mockedEducationsService.deleteOne(anything())).thenReject(new EducationNotFoundException());

      await expect(educationsController.deleteOne(user, { educationId: 'inexistent_id' })).to.eventually.be.rejectedWith(
        EducationNotFoundException
      );

      verify(mockedEducationsService.deleteOne({ user, educationId: createdEducation.educationId })).never();
    });

    it("should throw a education not found exception if user don't have permission and is not admin", async () => {
      when(mockedEducationsService.deleteOne(anything())).thenReject(new EducationNotFoundException());

      await expect(educationsController.deleteOne(user, { educationId: createdEducation.educationId })).to.be.rejectedWith(
        EducationNotFoundException
      );
      verify(mockedEducationsService.deleteOne({ user, educationId: createdEducation.educationId })).never();
    });
  });
});
