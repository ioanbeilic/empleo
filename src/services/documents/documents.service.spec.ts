import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { DeleteResult, Repository } from 'typeorm';
import { documentCreateBuilder } from '../../builders/document/document-create.builder';
import { documentBuilder } from '../../builders/document/document.builder';
import { DocumentCreate } from '../../dto/document-create.dto';
import { Document } from '../../entities/document.entity';
import { DocumentNotFoundException } from '../../errors/documents-not-found.exception';
import { CvService } from '../cv/cv.service';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let mockedDocumentRepository: Repository<Document>;
  let documentsService: DocumentsService;
  let mockedCvService: CvService;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const documentCreate: DocumentCreate = documentCreateBuilder()
    .withValidData()
    .build();

  const document: Document = documentBuilder()
    .withValidData()
    .build();

  const createdDocument = documentBuilder()
    .hydrate(document)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedDocumentRepository = (mock(Repository) as unknown) as Repository<Document>;
    mockedCvService = mock(CvService);
    documentsService = new DocumentsService(instance(mockedDocumentRepository), instance(mockedCvService));
  });

  describe('#create()', () => {
    it('should correctly create a document', async () => {
      when(mockedDocumentRepository.create(anything() as Partial<Document>)).thenReturn(document);
      when(mockedCvService.ensureExists(anything())).thenResolve();
      when(mockedDocumentRepository.save(document)).thenResolve(createdDocument);

      await documentsService.createDocument({ user, document: documentCreate });

      verify(mockedDocumentRepository.create(deepEqual({ ...documentCreate, keycloakId: user.id }))).once();
      verify(mockedCvService.ensureExists(user.id));
      verify(mockedDocumentRepository.save(document)).once();
    });
  });

  describe('#deleteOne()', () => {
    it('should correctly delete a document stage', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };

      when(mockedDocumentRepository.delete(anything())).thenResolve(deleteResult);

      const documentId = createdDocument.documentId;
      const result = await documentsService.deleteOne({ user, documentId });

      verify(mockedDocumentRepository.delete(deepEqual({ documentId, keycloakId: user.id }))).once();

      expect(result).to.be.undefined;
    });

    it('should throw an document not found exception when the document does not exists', async () => {
      const documentId = createdDocument.documentId;
      const deleteResult: DeleteResult = { affected: 0, raw: [] };

      when(mockedDocumentRepository.delete(anything())).thenResolve(deleteResult);

      await expect(documentsService.deleteOne({ documentId, user })).eventually.be.rejectedWith(DocumentNotFoundException);

      verify(mockedDocumentRepository.delete(deepEqual({ documentId, keycloakId: user.id }))).once();
    });

    it('should throw an document not found exception when the document exists but it does not belong to the user', async () => {
      const documentId = createdDocument.documentId;
      const deleteResult: DeleteResult = { affected: 0, raw: [] };
      const anotherUser = userBuilder()
        .withValidData()
        .build();

      when(mockedDocumentRepository.delete(anything())).thenResolve(deleteResult);

      await expect(documentsService.deleteOne({ documentId, user: anotherUser })).to.eventually.be.rejectedWith(DocumentNotFoundException);

      verify(mockedDocumentRepository.delete(deepEqual({ documentId, keycloakId: anotherUser.id }))).once();
    });
  });
});
