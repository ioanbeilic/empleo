import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker = require('faker');
import { anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { ExperienceNotFoundException } from '../../../src/errors/experience-not-found.exception';
import { experienceCreateBuilder } from '../../builders/experiences/experience-create.builder';
import { experienceBuilder } from '../../builders/experiences/experience.builder';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience } from '../../entities/experience.entity';
import { ExperiencesService } from './experiences.service';

describe('ExperiencesService', () => {
  let mockedExperienceRepository: Repository<Experience>;
  let experiencesService: ExperiencesService;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const experienceCreate: ExperienceCreate = experienceCreateBuilder()
    .withValidData()
    .build();

  const experience: Experience = experienceBuilder()
    .withValidData()
    .build();

  const createdExperience = experienceBuilder()
    .hydrate(experience)
    .withKeycloakId(user.id)
    .build();

  const experienceUpdate = experienceCreateBuilder()
    .withValidData()
    .build();

  beforeEach(() => {
    mockedExperienceRepository = (mock(Repository) as unknown) as Repository<Experience>;

    experiencesService = new ExperiencesService(instance(mockedExperienceRepository));
  });

  describe('#create()', () => {
    it('should correctly create a experience', async () => {
      when(mockedExperienceRepository.create(anything() as Partial<Experience>)).thenReturn(experience);

      when(mockedExperienceRepository.save(experience)).thenResolve(createdExperience);

      await experiencesService.createExperience({ user, experience: experienceCreate });

      verify(mockedExperienceRepository.create(objectContaining({ ...experienceCreate, keycloakId: user.id }))).once();
      verify(mockedExperienceRepository.save(experience)).once();
    });
  });

  describe('#updateOne()', () => {
    it('should update the experience when it exists and belong to the user', async () => {
      when(mockedExperienceRepository.update(anything(), anything() as Partial<Experience>)).thenResolve();

      await experiencesService.updateOne({ experience, update: experienceUpdate });

      verify(mockedExperienceRepository.update(deepEqual({ experienceId: experience.experienceId }), deepEqual(experienceUpdate))).once();
    });

    it('should throw an experience not found exception when the experience does not exists', async () => {
      const experienceId = faker.random.uuid();

      when(mockedExperienceRepository.findOne(anything())).thenResolve(undefined);

      await expect(
        experiencesService.findUserExperienceById({
          experienceId,
          user
        })
      ).to.eventually.be.rejectedWith(ExperienceNotFoundException);

      verify(mockedExperienceRepository.findOne(deepEqual({ experienceId, keycloakId: user.id }))).once();
    });

    it('should throw an experience not found exception when the experience exists but it does not belong to the user', async () => {
      const experienceId = createdExperience.experienceId;
      const anotherUser = userBuilder()
        .withValidData()
        .build();

      when(mockedExperienceRepository.findOne(anything())).thenResolve(undefined);

      await expect(
        experiencesService.findUserExperienceById({
          experienceId,
          user: anotherUser
        })
      ).to.eventually.be.rejectedWith(ExperienceNotFoundException);

      verify(mockedExperienceRepository.findOne(deepEqual({ experienceId, keycloakId: anotherUser.id }))).once();
    });
  });
});
