import { Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerBaseConfig } from '@nestjs/swagger';
import { AppConfigurationService } from './modules/configuration/cv.configuration.service';

@Injectable()
export class CvOpenApi {
  constructor(private readonly configurationService: AppConfigurationService) {}

  getDocument(): SwaggerBaseConfig {
    // This "really clever" patch is needed in order to make the api explorer usable when the app is deployed through api manager
    const isProduction = this.configurationService.isProduction;
    const basePath = isProduction ? '/empleo/cv/' : '/';
    const schemes: Array<'http' | 'https'> = isProduction ? ['https', 'http'] : ['http', 'https'];

    return new DocumentBuilder()
      .setTitle('CV Micro Service')
      .setDescription('Empleo micro service for managing CV')
      .setVersion(this.configurationService.getPackageVersion())
      .addTag('cv')
      .addBearerAuth()
      .setSchemes(...schemes)
      .setBasePath(basePath)
      .build();
  }
}
