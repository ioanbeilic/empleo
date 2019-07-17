import { Body, ClassSerializerInterceptor, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education } from '../../entities/education.entity';
import { CheckUserService } from '../../services/common/check-user.service';
import { EducationsService } from '../../services/educations/educations.service';
import { ApiKeycloakIdParam, FindByKeycloakIdParams } from './find-by-keycloak-id.params';

@Controller()
@ApiUseTags('educations')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class EducationsController {
  constructor(private readonly educationsService: EducationsService, private readonly checkUserService: CheckUserService) {}

  @Post(':keycloakId/educations')
  @Authorize.Candidates()
  @ApiOperation({ title: 'Create a education stage for logged user' })
  @ApiOkResponse({ type: Education, description: 'Education stage successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  @ApiKeycloakIdParam()
  async createEducation(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: FindByKeycloakIdParams,
    @Body() education: EducationCreate
  ): Promise<Education> {
    this.checkUserService.checkParam(user, keycloakId);
    return await this.educationsService.createEducation({ user, education });
  }
}
