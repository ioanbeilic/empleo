import { Body, ClassSerializerInterceptor, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, PermissionsService, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { DocumentCreate } from '../../dto/document-create.dto';
import { Document } from '../../entities/document.entity';
import { DocumentNotFoundException } from '../../errors/documents-not-found.exception';
import { DocumentsService } from '../../services/documents/documents.service';
import { ApiDocumentIdParam, FindOneParamsDocument } from './find-one-documents.params';

const documentNotFoundException = new DocumentNotFoundException();

@Controller()
@ApiUseTags('documents')
@Authenticate()
@UseInterceptors(ClassSerializerInterceptor)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService, private readonly permissionsService: PermissionsService) {}

  @Post(':keycloakId/documents')
  @Authorize.Candidates()
  @ApiKeycloakIdParam()
  @ApiOperation({ title: 'Add a document to a profile' })
  @ApiOkResponse({ type: Document, description: 'Document successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation or the keycloak id is not an uuid' })
  @ApiNotFoundResponse({ description: 'The CV does not exist or is trying to access a CV from another user' })
  async create(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: KeycloakIdParams,
    @Body() document: DocumentCreate
  ): Promise<Document> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } }, documentNotFoundException);

    return this.documentsService.createDocument({ user, document });
  }

  @Delete(':keycloakId/documents/:documentId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Remove a document by keycloakId and document id' })
  @ApiKeycloakIdParam()
  @ApiDocumentIdParam()
  @ApiNoContentResponse({ description: 'The document has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The document id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The document does not exist or does not belong to the user' })
  async deleteOneDocument(@AuthenticatedUser() user: User, @Param() { documentId, keycloakId }: FindOneParamsDocument): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });
    await this.documentsService.deleteOne({ user, documentId });
  }
}
