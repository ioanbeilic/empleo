import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { KeycloakIdParams } from 'empleo-nestjs-common';
import { CvId } from 'src/entities/cv.entity';

export class FindOneParamsCv extends KeycloakIdParams {
  @IsUUID()
  cvId!: CvId;
}

export function ApiCvIdParam() {
  return ApiImplicitParam({ name: 'educationId', type: 'string', description: 'Education identifier', required: true });
}
