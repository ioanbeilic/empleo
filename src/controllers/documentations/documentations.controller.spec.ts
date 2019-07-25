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
  let mockedCheckUserService: PermissionsService;
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
    mockedCheckUserService = mock(PermissionsService);
    documentationsController = new DocumentationsController(instance(mockedDocumentationsService), instance(mockedCheckUserService));
  });

  describe('#createDocumentation()', () => {
    it('should create a documentation', async () => {
      when(mockedCheckUserService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedDocumentationsService.createDocumentation(anything())).thenResolve(createdDocumentation);

      const keycloakId = user.id;
      const result = await documentationsController.create(user, { keycloakId }, documentationCreate);

      expect(result).to.be.equal(createdDocumentation);
      verify(
        mockedCheckUserService.isOwnerOrNotFound(
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
      when(mockedCheckUserService.isOwnerOrNotFound(anything(), anything())).thenThrow(new DocumentationNotFoundException());
      when(mockedDocumentationsService.createDocumentation(anything())).thenResolve(createdDocumentation);

      const keycloakId = faker.random.uuid();

      await expect(documentationsController.create(user, { keycloakId }, documentation)).to.eventually.be.rejectedWith(
        DocumentationNotFoundException
      );

      verify(
        mockedCheckUserService.isOwnerOrNotFound(
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
});
