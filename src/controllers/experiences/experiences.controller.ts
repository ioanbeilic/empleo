import { Body, ClassSerializerInterceptor, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience } from '../../entities/experience.entity';
import { ExperienceNotFoundException } from '../../errors/experience-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { ExperiencesService } from '../../services/experiences/experiences.service';

const experienceNotFoundException = new ExperienceNotFoundException();

@Controller()
@ApiUseTags('experiences')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService, private readonly permissionsService: PermissionsService) {}

  @Post(':keycloakId/experiences')
  @Authorize.Candidates()
  @ApiKeycloakIdParam()
  @ApiOperation({ title: 'Create a Experience stage, recommended date format: new Date().toIsoString() and return  2019-07-10 ' })
  @ApiOkResponse({ type: Experience, description: 'Experience stage successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  async create(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: KeycloakIdParams,
    @Body() experience: ExperienceCreate
  ): Promise<Experience> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } }, experienceNotFoundException);

    return this.experiencesService.createExperience({ user, experience });
  }
}
