import { Module } from '@nestjs/common';
import { POSTGRES_URI } from '../cv.keys';
import { CvConfigurationService } from './cv-configuration.service';

const providers = [
  CvConfigurationService,
  {
    provide: POSTGRES_URI,
    useFactory(appConfigurationService: CvConfigurationService) {
      return appConfigurationService.config().POSTGRES_URI;
    },
    inject: [CvConfigurationService]
  }
];

@Module({ providers, exports: providers })
export class CvConfigurationModule {}
