import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyOfClass, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { EducationsService } from '../../services/educations/educations.service';
import { EducationsController } from './educations.controller';

describe('EducationsController', () => {
  let mockedEducationsService: EducationsService;
  let mockedPermissionsService: PermissionsService;
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
    mockedPermissionsService = mock(PermissionsService);
    educationsController = new EducationsController(instance(mockedEducationsService), instance(mockedPermissionsService));
  });

  describe('#createEducation()', () => {
    it('should create a education', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

      const keycloakId = user.id;
      const result = await educationsController.createEducation(user, { keycloakId }, educationCreate);

      expect(result).to.be.equal(createdEducation);
      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(EducationNotFoundException)
        )
      ).once();
      verify(mockedEducationsService.createEducation(deepEqual({ user, education: educationCreate }))).once();
    });

    it('should throw a not found error when the user is not the owner of the resource', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenThrow(new EducationNotFoundException());
      when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

      const keycloakId = faker.random.uuid();

      await expect(educationsController.createEducation(user, { keycloakId }, education)).to.eventually.be.rejectedWith(
        EducationNotFoundException
      );

      verify(
        mockedPermissionsService.isOwnerOrNotFound(
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

      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenReturn(true);
      when(mockedEducationsService.updateOne(anything())).thenResolve();
      when(mockedEducationsService.findUserEducationById(anything())).thenResolve(createdEducation);

      const responseEducation = await educationsController.updateEducation(user, educationUpdate, {
        educationId,
        keycloakId: user.id
      });

      expect(responseEducation).to.be.undefined;
      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: user.id } }))).once();
      verify(mockedEducationsService.findUserEducationById(deepEqual({ educationId, user }))).calledBefore(
        mockedEducationsService.updateOne(
          deepEqual({
            education: createdEducation,
            update: educationUpdate
          })
        )
      );
    });

    it('should throw an education not found exception when the education does not exist', async () => {
      const educationId = createdEducation.educationId;
      const keycloakId = user.id;

      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenReturn(true);
      when(mockedEducationsService.updateOne(anything())).thenResolve();
      when(mockedEducationsService.findUserEducationById(anything())).thenReject(new EducationNotFoundException());

      await expect(
        educationsController.updateEducation(user, educationUpdate, {
          educationId,
          keycloakId
        })
      ).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedEducationsService.findUserEducationById(deepEqual({ educationId, user }))).once();
      verify(mockedEducationsService.updateOne(anything())).never();
    });

    it('should throw an education not found error when trying to access an cv from another user', async () => {
      const educationId = createdEducation.educationId;
      const keycloakId = user.id;

      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new EducationNotFoundException());
      when(mockedEducationsService.updateOne(anything())).thenResolve();
      when(mockedEducationsService.findUserEducationById(anything())).thenResolve(createdEducation);

      await expect(
        educationsController.updateEducation(user, educationUpdate, {
          educationId,
          keycloakId
        })
      ).to.eventually.be.rejectedWith(EducationNotFoundException);
      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedEducationsService.findUserEducationById(deepEqual({ educationId, user }))).never();
      verify(mockedEducationsService.updateOne(anything())).never();
    });
  });

  describe('#deleteOne()', () => {
    const educationId = createdEducation.educationId;
    const keycloakId = user.id;

    it('should correctly delete a education', async () => {
      when(mockedEducationsService.deleteOne(anything())).thenResolve();

      const response = await educationsController.deleteOneEducation(user, { educationId, keycloakId });

      verify(mockedEducationsService.deleteOne(deepEqual({ user, educationId }))).once();
      expect(response).to.be.undefined;
    });

    it('should throw an education not found exception when the education does not exist', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new EducationNotFoundException());
      when(mockedEducationsService.deleteOne(anything())).thenReject();

      await expect(
        educationsController.deleteOneEducation(user, { educationId: faker.random.uuid(), keycloakId: user.id })
      ).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedEducationsService.deleteOne(anything())).never();
    });

    it("should throw a education not found exception if user don't have permission and is not admin", async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new EducationNotFoundException());
      when(mockedEducationsService.deleteOne(anything())).thenReject();

      const anotherKeycloakId = faker.random.uuid();

      await expect(
        educationsController.deleteOneEducation(user, { educationId: createdEducation.educationId, keycloakId: anotherKeycloakId })
      ).to.be.rejectedWith(EducationNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: anotherKeycloakId } }))).once();
      verify(mockedEducationsService.deleteOne({ user, educationId: createdEducation.educationId })).never();
    });
  });
});
