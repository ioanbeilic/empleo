import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { KeycloakIdParams } from 'empleo-nestjs-common';
import { DocumentationId } from '../../entities/documentation.entity';

export class FindOneParamsDocumentation extends KeycloakIdParams {
  @IsUUID()
  documentationId!: DocumentationId;
}

export function ApiDocumentationIdParam() {
  return ApiImplicitParam({ name: 'documentationId', type: 'string', description: 'Documentation identifier', required: true });
}
