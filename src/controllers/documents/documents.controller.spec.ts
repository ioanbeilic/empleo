import { expect } from 'chai';
import { PermissionsService, userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyOfClass, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { documentCreateBuilder } from '../../builders/documents/documents-create.builder';
import { documentBuilder } from '../../builders/documents/documents.builder';
import { DocumentNotFoundException } from '../../errors/documents-not-found.exception';
import { DocumentsService } from '../../services/documents/documents.service';
import { DocumentsController } from './documents.controller';

describe('DocumentsController', () => {
  let mockedDocumentsService: DocumentsService;
  let mockedPermissionsService: PermissionsService;
  let documentsController: DocumentsController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const documentCreate = documentCreateBuilder()
    .withValidData()
    .build();

  const document = documentBuilder()
    .hydrate(documentCreate)
    .withoutDocumentId()
    .build();

  const createdDocument = documentBuilder()
    .hydrate(document)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedDocumentsService = mock(DocumentsService);
    mockedPermissionsService = mock(PermissionsService);
    documentsController = new DocumentsController(instance(mockedDocumentsService), instance(mockedPermissionsService));
  });

  describe('#createDocument()', () => {
    it('should create a document', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedDocumentsService.createDocument(anything())).thenResolve(createdDocument);

      const keycloakId = user.id;
      const result = await documentsController.create(user, { keycloakId }, documentCreate);

      expect(result).to.be.equal(createdDocument);
      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(DocumentNotFoundException)
        )
      ).once();
      verify(mockedDocumentsService.createDocument(deepEqual({ user, document: documentCreate }))).once();
    });

    it('should throw a not found error when the user is not the owner of the resource', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenThrow(new DocumentNotFoundException());
      when(mockedDocumentsService.createDocument(anything())).thenResolve(createdDocument);

      const keycloakId = faker.random.uuid();

      await expect(documentsController.create(user, { keycloakId }, document)).to.eventually.be.rejectedWith(DocumentNotFoundException);

      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(DocumentNotFoundException)
        )
      ).once();
      verify(mockedDocumentsService.createDocument(anything())).never();
    });
  });

  describe('#deleteOne()', () => {
    const documentId = createdDocument.documentId;
    const keycloakId = user.id;

    it('should correctly delete a document', async () => {
      when(mockedDocumentsService.deleteOne(anything())).thenResolve();

      const response = await documentsController.deleteOneDocument(user, { documentId, keycloakId });

      verify(mockedDocumentsService.deleteOne(deepEqual({ user, documentId }))).once();
      expect(response).to.be.undefined;
    });

    it('should throw an document not found exception when the document does not exist', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new DocumentNotFoundException());
      when(mockedDocumentsService.deleteOne(anything())).thenReject();

      await expect(
        documentsController.deleteOneDocument(user, { documentId: faker.random.uuid(), keycloakId: user.id })
      ).to.eventually.be.rejectedWith(DocumentNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedDocumentsService.deleteOne(anything())).never();
    });

    it("should throw a document not found exception if user don't have permission", async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new DocumentNotFoundException());
      when(mockedDocumentsService.deleteOne(anything())).thenReject();

      const anotherKeycloakId = faker.random.uuid();

      await expect(
        documentsController.deleteOneDocument(user, {
          documentId: createdDocument.documentId,
          keycloakId: anotherKeycloakId
        })
      ).to.be.rejectedWith(DocumentNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: anotherKeycloakId } }))).once();
      verify(mockedDocumentsService.deleteOne({ user, documentId: createdDocument.documentId })).never();
    });
  });
});
