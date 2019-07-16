import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { AppConfigurationModule } from './configuration/app.configuration.module';

import { POSTGRES_URI } from './app.keys';
import { EducationsModule } from './modules/educations.module';
import { OpenApi } from './openapi';

@Module({
  imports: [
    HttpModule,
    AuthenticationModule,
    AppConfigurationModule,
    PaginationModule,
    TypeOrmModule.forFeature([], 'cv_microservice'),
    TypeOrmModule.forRootAsync({
      name: 'cv_microservice',
      imports: [AppConfigurationModule],
      useFactory(postgresUri: string) {
        return {
          url: postgresUri,
          name: 'cv_microservice',
          type: 'postgres',
          entities: [],
          synchronize: true
        };
      },
      inject: [POSTGRES_URI]
    }),
    EducationsModule
  ],
  providers: [OpenApi]
})
export class AppModule {}
