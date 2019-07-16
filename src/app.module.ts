import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { AppConfigurationModule } from './modules/configuration/cv.configuration.module';

import { POSTGRES_URI } from './cv.keys';
import { CvOpenApi } from './cv.openapi';
import { EducationsModule } from './modules/educations.module';
import { Education } from './modules/entities/education.entity';

@Module({
  imports: [
    HttpModule,
    AuthenticationModule,
    AppConfigurationModule,
    PaginationModule,
    TypeOrmModule.forFeature([Education]),
    TypeOrmModule.forRootAsync({
      name: '',
      imports: [AppConfigurationModule],
      useFactory(postgresUri: string) {
        return {
          url: postgresUri,
          name: '',
          type: 'postgres',
          entities: [Education],
          synchronize: true
        };
      },
      inject: [POSTGRES_URI]
    }),
    EducationsModule
  ],
  providers: [CvOpenApi]
})
export class AppModule {}
