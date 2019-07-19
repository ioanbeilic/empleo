import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { KeycloakIdParams } from 'empleo-nestjs-common';
import { EducationId } from '../../entities/education.entity';

export class FindOneParamsEducation extends KeycloakIdParams {
  @IsUUID()
  educationId!: EducationId;
}

export function ApiEducationIdParam() {
  return ApiImplicitParam({ name: 'educationId', type: 'string', description: 'Education identifier', required: true });
}
