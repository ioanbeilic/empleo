import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { KeycloakIdParams } from 'empleo-nestjs-common';
import { DocumentId } from '../../entities/document.entity';

export class FindOneParamsDocument extends KeycloakIdParams {
  @IsUUID()
  documentId!: DocumentId;
}

export function ApiDocumentIdParam() {
  return ApiImplicitParam({ name: 'documentId', type: 'string', description: 'Document identifier', required: true });
}
