import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education } from '../../entities/education.entity';
import { EducationsService } from '../../services/educations/educations.service';

@Controller('educations')
@ApiUseTags('educations')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class EducationsController {
  constructor(private readonly educationsService: EducationsService) {}

  @Post()
  @Authorize.Candidates()
  @ApiOperation({ title: 'Create a education stage for logged user' })
  @ApiOkResponse({ type: Education, description: 'Education stage successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  async createEducation(@AuthenticatedUser() user: User, @Body() education: EducationCreate): Promise<Education> {
    return await this.educationsService.createEducation({ user, education });
  }
}
