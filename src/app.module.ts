import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { POSTGRES_URI } from './cv.keys';
import { CvOpenApi } from './cv.openapi';
import { AppConfigurationModule } from './modules/configuration/cv.configuration.module';
import { EducationsController } from './modules/controllers/educations/educations.controller';
import { Education } from './modules/entities/education.entity';
import { EducationsService } from './modules/services/educations/educations.service';

@Module({
  controllers: [EducationsController],
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
    })
  ],
  providers: [CvOpenApi, EducationsService]
})
export class AppModule {}
