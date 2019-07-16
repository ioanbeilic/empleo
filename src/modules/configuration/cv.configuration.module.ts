import { Module } from '@nestjs/common';
import { POSTGRES_URI } from '../../app.keys';
import { AppConfigurationService } from './cv.configuration.service';

const providers = [
  AppConfigurationService,
  {
    provide: POSTGRES_URI,
    useFactory(appConfigurationService: AppConfigurationService) {
      return appConfigurationService.config().POSTGRES_URI;
    },
    inject: [AppConfigurationService]
  }
];

@Module({ providers, exports: providers })
export class AppConfigurationModule {}
