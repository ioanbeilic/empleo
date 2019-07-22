import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker = require('faker');
import { anyOfClass, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ExperiencesService } from '../..//services/experiences/experiences.service';
import { experienceCreateBuilder } from '../../builders/experiences/experience-create.builder';
import { experienceBuilder } from '../../builders/experiences/experience.builder';
import { ExperienceNotFoundException } from '../../errors/experience-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { ExperiencesController } from './experiences.controller';

describe('ExperiencesController', () => {
  let mockedExperiencesService: ExperiencesService;
  let mockedCheckUserService: PermissionsService;
  let experiencesController: ExperiencesController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const experienceCreate = experienceCreateBuilder()
    .withValidData()
    .build();

  const experience = experienceBuilder()
    .hydrate(experienceCreate)
    .withoutExperienceId()
    .build();

  const createdExperience = experienceBuilder()
    .hydrate(experience)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedExperiencesService = mock(ExperiencesService);
    mockedCheckUserService = mock(PermissionsService);
    experiencesController = new ExperiencesController(instance(mockedExperiencesService), instance(mockedCheckUserService));
  });

  describe('#createExperience()', () => {
    it('should create a experience', async () => {
      when(mockedCheckUserService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedExperiencesService.createExperience(anything())).thenResolve(createdExperience);

      const keycloakId = user.id;
      const result = await experiencesController.create(user, { keycloakId }, experienceCreate);

      expect(result).to.be.equal(createdExperience);
      verify(
        mockedCheckUserService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(ExperienceNotFoundException)
        )
      ).once();
      verify(mockedExperiencesService.createExperience(deepEqual({ user, experience: experienceCreate }))).once();
    });

    it('should throw a not found error when the user is not the owner of the resource', async () => {
      when(mockedCheckUserService.isOwnerOrNotFound(anything(), anything())).thenThrow(new ExperienceNotFoundException());
      when(mockedExperiencesService.createExperience(anything())).thenResolve(createdExperience);

      const keycloakId = faker.random.uuid();

      await expect(experiencesController.create(user, { keycloakId }, experience)).to.eventually.be.rejectedWith(
        ExperienceNotFoundException
      );

      verify(
        mockedCheckUserService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(ExperienceNotFoundException)
        )
      ).once();
      verify(mockedExperiencesService.createExperience(anything())).never();
    });
  });
});
