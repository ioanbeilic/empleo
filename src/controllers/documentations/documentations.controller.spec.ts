import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyOfClass, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { documentationCreateBuilder } from '../../builders/documentations/documentations-create.builder';
import { documentationBuilder } from '../../builders/documentations/documentations.builder';
import { DocumentationNotFoundException } from '../../errors/documentation-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { DocumentationsService } from '../../services/documentations/documentations.service';
import { DocumentationsController } from './documentations.controller';

describe('DocumentationsController', () => {
  let mockedDocumentationsService: DocumentationsService;
  let mockedPermissionsService: PermissionsService;
  let documentationsController: DocumentationsController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const documentationCreate = documentationCreateBuilder()
    .withValidData()
    .build();

  const documentation = documentationBuilder()
    .hydrate(documentationCreate)
    .withoutDocumentationId()
    .build();

  const createdDocumentation = documentationBuilder()
    .hydrate(documentation)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedDocumentationsService = mock(DocumentationsService);
    mockedPermissionsService = mock(PermissionsService);
    documentationsController = new DocumentationsController(instance(mockedDocumentationsService), instance(mockedPermissionsService));
  });

  describe('#createDocumentation()', () => {
    it('should create a documentation', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedDocumentationsService.createDocumentation(anything())).thenResolve(createdDocumentation);

      const keycloakId = user.id;
      const result = await documentationsController.create(user, { keycloakId }, documentationCreate);

      expect(result).to.be.equal(createdDocumentation);
      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(DocumentationNotFoundException)
        )
      ).once();
      verify(mockedDocumentationsService.createDocumentation(deepEqual({ user, documentation: documentationCreate }))).once();
    });

    it('should throw a not found error when the user is not the owner of the resource', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenThrow(new DocumentationNotFoundException());
      when(mockedDocumentationsService.createDocumentation(anything())).thenResolve(createdDocumentation);

      const keycloakId = faker.random.uuid();

      await expect(documentationsController.create(user, { keycloakId }, documentation)).to.eventually.be.rejectedWith(
        DocumentationNotFoundException
      );

      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(DocumentationNotFoundException)
        )
      ).once();
      verify(mockedDocumentationsService.createDocumentation(anything())).never();
    });
  });

  describe('#deleteOne()', () => {
    const documentationId = createdDocumentation.documentationId;
    const keycloakId = user.id;

    it('should correctly delete a documentation', async () => {
      when(mockedDocumentationsService.deleteOne(anything())).thenResolve();

      const response = await documentationsController.deleteOneDocumentation(user, { documentationId, keycloakId });

      verify(mockedDocumentationsService.deleteOne(deepEqual({ user, documentationId }))).once();
      expect(response).to.be.undefined;
    });

    it('should throw an documentation not found exception when the documentation does not exist', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new DocumentationNotFoundException());
      when(mockedDocumentationsService.deleteOne(anything())).thenReject();

      await expect(
        documentationsController.deleteOneDocumentation(user, { documentationId: faker.random.uuid(), keycloakId: user.id })
      ).to.eventually.be.rejectedWith(DocumentationNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedDocumentationsService.deleteOne(anything())).never();
    });

    it("should throw a documentation not found exception if user don't have permission", async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new DocumentationNotFoundException());
      when(mockedDocumentationsService.deleteOne(anything())).thenReject();

      const anotherKeycloakId = faker.random.uuid();

      await expect(
        documentationsController.deleteOneDocumentation(user, {
          documentationId: createdDocumentation.documentationId,
          keycloakId: anotherKeycloakId
        })
      ).to.be.rejectedWith(DocumentationNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: anotherKeycloakId } }))).once();
      verify(mockedDocumentationsService.deleteOne({ user, documentationId: createdDocumentation.documentationId })).never();
    });
  });
});
