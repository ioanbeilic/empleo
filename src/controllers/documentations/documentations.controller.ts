import { Body, ClassSerializerInterceptor, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUseTags
} from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, PermissionsService, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { DocumentationCreate } from '../../dto/documentation-create.dto';
import { Documentation } from '../../entities/documentation.entity';
import { DocumentationNotFoundException } from '../../errors/documentation-not-found.exception';
import { DocumentationsService } from '../../services/documentations/documentations.service';
import { ApiDocumentationIdParam, FindOneParamsDocumentation } from './find-one-documentation.params';

const documentationNotFoundException = new DocumentationNotFoundException();

@Controller()
@ApiUseTags('documentations')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class DocumentationsController {
  constructor(private readonly documentationsService: DocumentationsService, private readonly permissionsService: PermissionsService) {}

  @Post(':keycloakId/documentations')
  @Authorize.Candidates()
  @ApiKeycloakIdParam()
  @ApiOperation({ title: 'Add a document to a profile' })
  @ApiOkResponse({ type: Documentation, description: 'Document successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation or the keycloak id is not an uuid' })
  @ApiNotFoundResponse({ description: 'The CV does not exist or is trying to access a CV from another user' })
  async create(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: KeycloakIdParams,
    @Body() documentation: DocumentationCreate
  ): Promise<Documentation> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } }, documentationNotFoundException);

    return this.documentationsService.createDocumentation({ user, documentation });
  }

  @Delete(':keycloakId/documentations/:documentationId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Remove a documentation by keycloakId and documentation id' })
  @ApiKeycloakIdParam()
  @ApiDocumentationIdParam()
  @ApiNoContentResponse({ description: 'The documentation has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The documentation id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The documentation does not exist or does not belong to the user' })
  async deleteOneDocumentation(
    @AuthenticatedUser() user: User,
    @Param() { documentationId, keycloakId }: FindOneParamsDocumentation
  ): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });
    await this.documentationsService.deleteOne({ user, documentationId });
  }
}
