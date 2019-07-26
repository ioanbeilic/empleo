import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { documentationCreateBuilder } from '../../builders/documentations/documentations-create.builder';
import { documentationBuilder } from '../../builders/documentations/documentations.builder';
import { DocumentationCreate } from '../../dto/documentation-create.dto';
import { Documentation } from '../../entities/documentation.entity';
import { CvService } from '../cv/cv.service';
import { DocumentationsService } from './documentations.service';

describe('DocumentationsService', () => {
  let mockedDocumentationRepository: Repository<Documentation>;
  let documentationsService: DocumentationsService;
  let mockedCvService: CvService;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const documentationCreate: DocumentationCreate = documentationCreateBuilder()
    .withValidData()
    .build();

  const documentation: Documentation = documentationBuilder()
    .withValidData()
    .build();

  const createdDocumentation = documentationBuilder()
    .hydrate(documentation)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedDocumentationRepository = (mock(Repository) as unknown) as Repository<Documentation>;
    mockedCvService = mock(CvService);
    documentationsService = new DocumentationsService(instance(mockedDocumentationRepository), instance(mockedCvService));
  });

  describe('#create()', () => {
    it('should correctly create a documentation', async () => {
      when(mockedDocumentationRepository.create(anything() as Partial<Documentation>)).thenReturn(documentation);
      when(mockedCvService.ensureExists(anything())).thenResolve();
      when(mockedDocumentationRepository.save(documentation)).thenResolve(createdDocumentation);

      await documentationsService.createDocumentation({ user, documentation: documentationCreate });

      verify(mockedDocumentationRepository.create(objectContaining({ ...documentationCreate, keycloakId: user.id }))).once();
      verify(mockedCvService.ensureExists(deepEqual({ keycloakId: user.id })));
      verify(mockedDocumentationRepository.save(documentation)).once();
    });
  });
});
