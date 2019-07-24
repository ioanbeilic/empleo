import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { CvConfigurationModule } from './configuration/cv-configuration.module';
import { EducationsController } from './controllers/educations/educations.controller';
import { ExperiencesController } from './controllers/experiences/experiences.controller';
import { POSTGRES_URI } from './cv.keys';
import { CvOpenapi } from './cv.openapi';
import { Education } from './entities/education.entity';
import { Experience } from './entities/experience.entity';
import { Language } from './entities/language.entity';
import { PermissionsService } from './services/common/permissions.service';
import { EducationsService } from './services/educations/educations.service';
import { ExperiencesService } from './services/experiences/experiences.service';

@Module({
  controllers: [EducationsController, ExperiencesController],
  imports: [
    AuthenticationModule,
    CvConfigurationModule,
    PaginationModule,
    TypeOrmModule.forFeature([Education, Experience, Language]),
    TypeOrmModule.forRootAsync({
      imports: [CvConfigurationModule],
      useFactory(postgresUri: string) {
        return {
          url: postgresUri,
          type: 'postgres',
          entities: [Education, Experience, Language],
          synchronize: true
        };
      },
      inject: [POSTGRES_URI]
    })
  ],
  providers: [CvOpenapi, EducationsService, PermissionsService, ExperiencesService]
})
export class CvModule {}
