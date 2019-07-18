import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { Education } from '../../entities/education.entity';
import { EducationsService } from './educations.service';

describe('EducationService', () => {
  let mockedEducationRepository: Repository<Education>;
  let educationService: EducationsService;

  let educationRepository: Repository<Education>;

  const user = userBuilder()
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
    mockedEducationRepository = (mock(Repository) as unknown) as Repository<Education>;
    educationRepository = instance(mockedEducationRepository);
    educationService = new EducationsService(educationRepository);
  });

  describe('#create()', () => {
    it('should correctly create a education', async () => {
      when(mockedEducationRepository.create(anything() as Partial<Education>)).thenReturn(education);

      when(mockedEducationRepository.save(education)).thenResolve(createdEducation);

      await educationService.createEducation({ user, education: educationCreate });

      verify(mockedEducationRepository.create(objectContaining({ ...educationCreate, keycloakId: user.id }))).once();
      verify(mockedEducationRepository.save(education)).once();
    });
  });
});
