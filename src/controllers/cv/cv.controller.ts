import { ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
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
import { Cv } from '../../entities/cv.entity';
import { CvService } from '../../services/cv/cv.service';

@Controller()
@ApiUseTags('cv')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class CvController {
  constructor(private readonly cvService: CvService, private readonly permissionsService: PermissionsService) {}

  @Delete(':keycloakId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Completely removes a CV' })
  @ApiKeycloakIdParam()
  @ApiNoContentResponse({ description: 'The cv has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The keycloak id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The CV does not exist or does not belong to the user' })
  async deleteOneCv(@AuthenticatedUser() user: User, @Param() { keycloakId }: KeycloakIdParams): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });

    await this.cvService.deleteOne(keycloakId);
  }

  @Get(':keycloakId')
  @Authorize.Candidates()
  @ApiOperation({
    title: 'List a cv of logged user',
    description: 'The response will include the full CV, including educations, experiences, languages and documents'
  })
  @ApiKeycloakIdParam()
  @ApiOkResponse({ type: Cv, isArray: true })
  async findCvByUser(@AuthenticatedUser() user: User, @Param() { keycloakId }: KeycloakIdParams): Promise<Cv> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });

    return this.cvService.findByUser(user);
  }
}
