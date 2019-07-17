import { ConfigurationService } from 'empleo-nestjs-configuration';
import { CvConfiguration } from './cv-configuration';
import schema from './cv-configuration.schema.json';

export class CvConfigurationService extends ConfigurationService<CvConfiguration> {
  constructor() {
    super(schema, 'cv');
  }
}
