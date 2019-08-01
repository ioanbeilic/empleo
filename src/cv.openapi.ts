import { Inject, Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerBaseConfig } from '@nestjs/swagger';
import { KEYCLOAK_AUTHORIZATION_URI, KEYCLOAK_TOKEN_URI } from 'empleo-nestjs-authentication';
import { CvConfigurationService } from './configuration/cv-configuration.service';

@Injectable()
export class CvOpenapi {
  constructor(
    private readonly configurationService: CvConfigurationService,
    @Inject(KEYCLOAK_AUTHORIZATION_URI) private readonly authUri: string,
    @Inject(KEYCLOAK_TOKEN_URI) private readonly tokenUri: string
  ) {}

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
      .addOAuth2('password', this.authUri, this.tokenUri)
      .addBearerAuth()
      .setSchemes(...schemes)
      .setBasePath(basePath)
      .build();
  }
}
