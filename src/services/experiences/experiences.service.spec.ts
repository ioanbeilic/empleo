import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { DeleteResult, Repository } from 'typeorm';
import { experienceCreateBuilder } from '../../builders/experiences/experience-create.builder';
import { experienceBuilder } from '../../builders/experiences/experience.builder';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience } from '../../entities/experience.entity';
import { ExperienceNotFoundException } from '../../errors/experience-not-found.exception';
import { CvService } from '../cv/cv.service';
import { ExperiencesService } from './experiences.service';

describe('ExperiencesService', () => {
  let mockedExperienceRepository: Repository<Experience>;
  let experiencesService: ExperiencesService;
  let mockedCvService: CvService;

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
    mockedCvService = mock(CvService);
    experiencesService = new ExperiencesService(instance(mockedExperienceRepository), instance(mockedCvService));
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
  });

  describe('#deleteOne()', () => {
    it('should correctly delete a experience stage', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };

      when(mockedExperienceRepository.delete(anything())).thenResolve(deleteResult);

      const experienceId = createdExperience.experienceId;
      const result = await experiencesService.deleteOne({ user, experienceId });

      verify(mockedExperienceRepository.delete(deepEqual({ experienceId, keycloakId: user.id }))).once();

      expect(result).to.be.undefined;
    });

    it('should throw an experience not found exception when the experience does not exists', async () => {
      const experienceId = createdExperience.experienceId;
      const deleteResult: DeleteResult = { affected: 0, raw: [] };

      when(mockedExperienceRepository.delete(anything())).thenResolve(deleteResult);

      await expect(experiencesService.deleteOne({ experienceId, user })).eventually.be.rejectedWith(ExperienceNotFoundException);

      verify(mockedExperienceRepository.delete(deepEqual({ experienceId, keycloakId: user.id }))).once();
    });

    it('should throw an experience not found exception when the experience exists but it does not belong to the user', async () => {
      const experienceId = createdExperience.experienceId;
      const deleteResult: DeleteResult = { affected: 0, raw: [] };
      const anotherUser = userBuilder()
        .withValidData()
        .build();

      when(mockedExperienceRepository.delete(anything())).thenResolve(deleteResult);

      await expect(experiencesService.deleteOne({ experienceId, user: anotherUser })).to.eventually.be.rejectedWith(
        ExperienceNotFoundException
      );

      verify(mockedExperienceRepository.delete(deepEqual({ experienceId, keycloakId: anotherUser.id }))).once();
    });
  });
});
