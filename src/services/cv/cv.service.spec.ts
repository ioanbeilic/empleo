import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { DeepPartial, Repository } from 'typeorm';
import { cvBuilder } from '../../builders/cv.builder';
import { Cv } from '../../entities/cv.entity';
import { CvService } from './cv.service';

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
      const cv = cvBuilder()
        .withValidData()
        .withKeycloakId(user.id)
        .withoutCvId()
        .build();

      when(mockedCvRepository.create(anything() as DeepPartial<Cv>)).thenReturn(cv);

      await cvService.ensureExists(user.id);

      verify(mockedCvRepository.save(cv)).once();
    });
  });

  describe('#findByUser()', () => {
    it('should find the cv', async () => {
      const cv = cvBuilder()
        .withValidData()
        .withKeycloakId(user.id)
        .build();

      when(mockedCvRepository.findOne(anything(), anything())).thenResolve(cv);

      const foundCv = await cvService.findByKeycloakId(user.id);

      verify(
        mockedCvRepository.findOne(
          deepEqual({ keycloakId: user.id }),
          deepEqual({ relations: ['educations', 'experiences', 'languages', 'documents'] })
        )
      ).once();
      expect(foundCv).to.be.equal(cv);
    });
  });
});
