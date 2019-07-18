import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
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
    .hydrate(educationCreate)
    .withoutEducationId()
    .withValidData()
    .build();

  const createdEducation = educationBuilder()
    .hydrate(education)
    .withEducationId()
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
      when(mockedEducationRepository.save(anything())).thenResolve(createdEducation);

      const result = await educationService.createEducation({ user, education: educationCreate });

      expect(result).to.be.equal(createdEducation);

      verify(
        mockedEducationRepository.create(
          deepEqual({
            ...educationCreate,
            educationId: anyString(),
            keycloakId: user.id
          })
        )
      ).once();
      verify(mockedEducationRepository.save(education)).once();
    });
  });
});
