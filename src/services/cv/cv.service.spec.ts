import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
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
      when(mockedCvRepository.create(anything())).thenResolve();

      await cvService.ensureExists({ keycloakId: user.id });

      verify(mockedCvRepository.save(anything())).once();
    });
  });
});
