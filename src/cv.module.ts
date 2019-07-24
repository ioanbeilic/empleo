import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { CvConfigurationModule } from './configuration/cv-configuration.module';
import { CvController } from './controllers/cv/cv.controller';
import { EducationsController } from './controllers/educations/educations.controller';
import { ExperiencesController } from './controllers/experiences/experiences.controller';
import { LanguagesController } from './controllers/languages/languages.controller';
import { POSTGRES_URI } from './cv.keys';
import { CvOpenapi } from './cv.openapi';
import { Cv } from './entities/cv.entity';
import { Education } from './entities/education.entity';
import { Experience } from './entities/experience.entity';
import { Language } from './entities/language.entity';
import { PermissionsService } from './services/common/permissions.service';
import { CvService } from './services/cv/cv.service';
import { EducationsService } from './services/educations/educations.service';
import { ExperiencesService } from './services/experiences/experiences.service';
import { LanguagesService } from './services/languages/languages.service';

@Module({
  controllers: [EducationsController, ExperiencesController, CvController, LanguagesController],
  imports: [
    AuthenticationModule,
    CvConfigurationModule,
    PaginationModule,
    TypeOrmModule.forFeature([Education, Experience, Cv, Language]),
    TypeOrmModule.forRootAsync({
      imports: [CvConfigurationModule],
      useFactory(postgresUri: string) {
        return {
          url: postgresUri,
          type: 'postgres',
          entities: [Education, Experience, Cv, Language],
          synchronize: true
        };
      },
      inject: [POSTGRES_URI]
    })
  ],
  providers: [CvOpenapi, EducationsService, PermissionsService, ExperiencesService, CvService, LanguagesService]
})
export class CvModule {}
