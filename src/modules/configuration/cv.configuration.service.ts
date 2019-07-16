import { ConfigurationService } from 'empleo-nestjs-configuration';
import { AppConfiguration } from './cv.configuration';
import schema from './cv.configuration.schema.json';

export class AppConfigurationService extends ConfigurationService<AppConfiguration> {
  constructor() {
    super(schema, 'app');
  }
}
