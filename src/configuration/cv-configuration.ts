import { Environment } from 'empleo-nestjs-configuration';

export interface CvConfiguration {
  NODE_ENV: Environment;
  POSTGRES_URI: string;
}
