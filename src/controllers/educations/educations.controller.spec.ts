import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyOfClass, anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { EducationsService } from '../../services/educations/educations.service';
import { EducationsController } from './educations.controller';

describe('EducationsController', () => {
  let mockedEducationsService: EducationsService;
  let mockedCheckUserService: PermissionsService;
  let educationsController: EducationsController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const educationCreate = educationCreateBuilder()
    .withValidData()
    .build();

  const education = educationBuilder()
    .hydrate(educationCreate)
    .withoutEducationId()
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
    mockedCheckUserService = mock(PermissionsService);
    educationsController = new EducationsController(instance(mockedEducationsService), instance(mockedCheckUserService));
  });

  describe('#createEducation()', () => {
    it('should create a education', async () => {
      when(mockedCheckUserService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

      const keycloakId = user.id;
      const result = await educationsController.createEducation(user, { keycloakId }, educationCreate);

      expect(result).to.be.equal(createdEducation);
      verify(
        mockedCheckUserService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(EducationNotFoundException)
        )
      ).once();
      verify(mockedEducationsService.createEducation(deepEqual({ user, education: educationCreate }))).once();
    });

    it('should throw a not found error when the user is not admin and not the owner of the resource', async () => {
      when(mockedCheckUserService.isOwnerOrNotFound(anything(), anything())).thenThrow(new EducationNotFoundException());
      when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

      const keycloakId = faker.random.uuid();

      await expect(educationsController.createEducation(user, { keycloakId }, education)).to.eventually.be.rejectedWith(
        EducationNotFoundException
      );

      verify(
        mockedCheckUserService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(EducationNotFoundException)
        )
      ).once();
      verify(mockedEducationsService.createEducation(anything())).never();
    });
  });

  describe('#updateOne()', () => {
    it('should update a education when it exists and belong to the user', async () => {
      const educationId = createdEducation.educationId;

      when(mockedEducationsService.updateOne(anything())).thenResolve();
      when(mockedEducationsService.findUserEducationById(anything())).thenResolve(createdEducation);

      const responseEducation = await educationsController.updateEducation(user, educationUpdate, { keycloakId: user.id }, { educationId });

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

      await expect(
        educationsController.updateEducation(user, educationUpdate, { keycloakId: user.id }, { educationId })
      ).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedEducationsService.findUserEducationById(objectContaining({ educationId, user }))).once();
      verify(mockedEducationsService.updateOne(anything())).never();
    });
  });
});
