import { ApiImplicitParam } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindByKeycloakIdParams {
  @IsUUID()
  keycloakId!: string;
}

/**
 * Helper decorator for defining the keycloak id path in swagger.
 *
 * This is necessary because in order to validate parameters
 * we need to provide an object defining the parameters validations
 * which does not automatically generate the swagger annotations
 */
export function ApiKeycloakIdParam() {
  return ApiImplicitParam({ name: 'keycloakId', type: 'string', description: 'User keycloak identifier', required: true });
}
