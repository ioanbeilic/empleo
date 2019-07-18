import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { EducationId } from '../../entities/education.entity';

export class FindOneParamsEducation {
  @IsUUID()
  educationId!: EducationId;
}

export function ApiEducationIdParam() {
  return ApiImplicitParam({ name: 'educationId', type: 'string', description: 'Education identifier', required: true });
}
