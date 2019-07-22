import { Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam } from 'empleo-nestjs-common';
import { PermissionsService } from '../../services/common/permissions.service';
import { CvService } from '../../services/cv/cv.service';
import { ApiCvIdParam, FindOneParamsCv } from './find-one-cv.params';

export class CvController {
  constructor(private readonly cvService: CvService, private readonly permissionsService: PermissionsService) {}

  @Delete(':keycloakId/cvs/:cvId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Remove a cv by keyclokId and all relational table' })
  @ApiKeycloakIdParam()
  @ApiCvIdParam()
  @ApiNoContentResponse({ description: 'The cv has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The cv id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The cv does not exist or does not belong to the user' })
  async deleteOneCv(@AuthenticatedUser() user: User, @Param() { cvId, keycloakId }: FindOneParamsCv): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });
    await this.cvService.deleteOne({ user, cvId });
  }
}
