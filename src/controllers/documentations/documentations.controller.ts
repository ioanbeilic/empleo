import { Body, ClassSerializerInterceptor, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { DocumentationCreate } from '../../dto/documentation-create.dto';
import { Documentation } from '../../entities/documentation.entity';
import { DocumentationNotFoundException } from '../../errors/documentation-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { DocumentationsService } from '../../services/documentations/documentations.service';

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
  @ApiOperation({ title: 'Create a Documentation stage' })
  @ApiOkResponse({ type: Documentation, description: 'Documentation stage successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  async create(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: KeycloakIdParams,
    @Body() documentation: DocumentationCreate
  ): Promise<Documentation> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } }, documentationNotFoundException);

    return this.documentationsService.createDocumentation({ user, documentation });
  }
}
