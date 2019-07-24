import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { KeycloakIdParams } from 'empleo-nestjs-common';
import { LanguageId } from '../../entities/language.entity';

export class FindOneParamsLanguage extends KeycloakIdParams {
  @IsUUID()
  languageId!: LanguageId;
}

export function ApiLanguageIdParam() {
  return ApiImplicitParam({ name: 'languageId', type: 'string', description: 'Language identifier', required: true });
}
