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
import { Authenticate, AuthenticatedUser, Authorize, PermissionsService, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education } from '../../entities/education.entity';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { EducationsService } from '../../services/educations/educations.service';
import { ApiEducationIdParam, FindOneParamsEducation } from './find-one-education.params';

const educationNotFoundException = new EducationNotFoundException();

@Controller()
@ApiUseTags('educations')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class EducationsController {
  constructor(private readonly educationsService: EducationsService, private readonly permissionsService: PermissionsService) {}

  @Post(':keycloakId/educations')
  @Authorize.Candidates()
  @ApiOperation({ title: 'Create a education stage for logged user' })
  @ApiOkResponse({ type: Education, description: 'Education stage successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  @ApiKeycloakIdParam()
  async createEducation(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: KeycloakIdParams,
    @Body() education: EducationCreate
  ): Promise<Education> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } }, educationNotFoundException);

    return this.educationsService.createEducation({ user, education });
  }

  @Put(':keycloakId/educations/:educationId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Edit a education stage by education id' })
  @ApiKeycloakIdParam()
  @ApiEducationIdParam()
  @ApiNoContentResponse({ type: Education, description: 'Education stage successfully updated' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  @ApiNotFoundResponse({ description: 'The education does not exist or it does not belong to the user' })
  async updateEducation(
    @AuthenticatedUser() user: User,
    @Body() update: EducationCreate,
    @Param() { educationId, keycloakId }: FindOneParamsEducation
  ): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });

    const education = await this.educationsService.findUserEducationById({ educationId, user });

    await this.educationsService.updateOne({ education, update });
  }

  @Delete(':keycloakId/educations/:educationId')
  @Authorize.Candidates()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ title: 'Remove a education by profile id and education id' })
  @ApiKeycloakIdParam()
  @ApiEducationIdParam()
  @ApiNoContentResponse({ description: 'The education has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'The education id is not an UUID' })
  @ApiNotFoundResponse({ description: 'The education does not exist or does not belong to the user' })
  async deleteOneEducation(@AuthenticatedUser() user: User, @Param() { educationId, keycloakId }: FindOneParamsEducation): Promise<void> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } });
    await this.educationsService.deleteOne({ user, educationId });
  }
}
