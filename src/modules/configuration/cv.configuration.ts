import { Environment } from 'empleo-nestjs-configuration';

export interface AppConfiguration {
  NODE_ENV: Environment;
  POSTGRES_URI: string;
}
