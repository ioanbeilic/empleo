import { ConfigurationService } from 'empleo-nestjs-configuration';
import { AppConfiguration } from './app.configuration';
import schema from './app.configuration.schema.json';

export class AppConfigurationService extends ConfigurationService<AppConfiguration> {
  constructor() {
    super(schema, 'app');
  }
}
