import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { experienceCreateBuilder } from '../../builders/experiences/experience-create.builder';
import { experienceBuilder } from '../../builders/experiences/experience.builder';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience } from '../../entities/experience.entity';
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
});
