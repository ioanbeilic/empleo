import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUseTags
} from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience } from '../../entities/experience.entity';
import { ExperienceNotFoundException } from '../../errors/experience-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { ExperiencesService } from '../../services/experiences/experiences.service';
import { ApiExperienceIdParam, FindOneParamsExperience } from './find-one-experience.params';

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
  @ApiOperation({ title: 'Create a Experience stage', description: 'The date format must be `YYYY-MM-DD`' })
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

  @Put(':keycloakId/experiences/:experienceId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Edit a experience stage by experience id' })
  @ApiKeycloakIdParam()
  @ApiExperienceIdParam()
  @ApiNoContentResponse({ type: Experience, description: 'Experience stage successfully updated' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  @ApiNotFoundResponse({ description: 'The experience does not exist or it does not belong to the user' })
  async updateExperience(
    @AuthenticatedUser() user: User,
    @Body() update: ExperienceCreate,
    @Param() { experienceId, keycloakId }: FindOneParamsExperience
  ): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });

    const experience = await this.experiencesService.findUserExperienceById({ experienceId, user });

    await this.experiencesService.updateOne({ experience, update });
  }

  @Delete(':keycloakId/experiences/:experienceId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Remove a experience by keycloakId and experience id' })
  @ApiKeycloakIdParam()
  @ApiExperienceIdParam()
  @ApiNoContentResponse({ description: 'The experience has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The experience id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The experience does not exist or does not belong to the user' })
  async deleteOneExperience(
    @AuthenticatedUser() user: User,
    @Param() { experienceId, keycloakId }: FindOneParamsExperience
  ): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });
    await this.experiencesService.deleteOne({ user, experienceId });
  }
}
