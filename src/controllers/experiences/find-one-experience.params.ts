import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { KeycloakIdParams } from 'empleo-nestjs-common';
import { ExperienceId } from '../../entities/experience.entity';

export class FindOneParamsExperience extends KeycloakIdParams {
  @IsUUID()
  experienceId!: ExperienceId;
}

export function ApiExperienceIdParam() {
  return ApiImplicitParam({ name: 'experienceId', type: 'string', description: 'Experience identifier', required: true });
}
