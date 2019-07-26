import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker = require('faker');
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Cv } from '../../entities/cv.entity';
import { CvService, ResponseCvOption } from './cv.service';

describe('CvService', () => {
  let mockedCvRepository: Repository<Cv>;
  let cvService: CvService;
  let cvRepository: Repository<Cv>;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  beforeEach(() => {
    mockedCvRepository = (mock(Repository) as unknown) as Repository<Cv>;
    cvRepository = instance(mockedCvRepository);
    cvService = new CvService(cvRepository);
  });

  describe('#ensureExists()', () => {
    it('should correctly insert keycloakId to cv', async () => {
      when(mockedCvRepository.create(anything())).thenResolve();

      await cvService.ensureExists({ keycloakId: user.id });

      verify(mockedCvRepository.save(anything())).once();
    });
  });

  describe('#findByUser()', () => {
    const cv: ResponseCvOption = {
      cvId: faker.random.uuid(),
      keycloakId: user.id,
      educations: [],
      experiences: [],
      languages: [],
      documentations: []
    };
    it('should find the cv', async () => {
      when(mockedCvRepository.findOne(anything(), anything())).thenResolve(cv);

      const response = await cvService.findByUser({ keycloakId: user.id });

      verify(
        mockedCvRepository.findOne(
          deepEqual({ keycloakId: user.id }),
          deepEqual({ relations: ['educations', 'experiences', 'languages', 'documentations'] })
        )
      ).once();
      expect(response).equal(cv);
    });
  });
});
