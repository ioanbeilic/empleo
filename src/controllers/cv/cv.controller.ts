import { ClassSerializerInterceptor, Controller, Delete, HttpCode, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { PermissionsService } from '../../services/common/permissions.service';
import { CvService } from '../../services/cv/cv.service';

@Controller()
@ApiUseTags('cv')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class CvController {
  constructor(private readonly cvService: CvService, private readonly permissionsService: PermissionsService) {}

  @Delete(':keycloakId/cv')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Completely removes a CV' })
  @ApiKeycloakIdParam()
  @ApiNoContentResponse({ description: 'The cv has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The keycloak id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The CV does not exist or does not belong to the user' })
  async deleteOneCv(@AuthenticatedUser() user: User, @Param() { keycloakId }: KeycloakIdParams): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });

    await this.cvService.deleteOne({ keycloakId: user.id });
  }
}
