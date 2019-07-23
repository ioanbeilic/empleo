import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { CvConfigurationModule } from './configuration/cv-configuration.module';
import { CvController } from './controllers/cv/cv.controller';
import { EducationsController } from './controllers/educations/educations.controller';
import { POSTGRES_URI } from './cv.keys';
import { CvOpenapi } from './cv.openapi';
import { Cv } from './entities/cv.entity';
import { Education } from './entities/education.entity';
import { PermissionsService } from './services/common/permissions.service';
import { CvService } from './services/cv/cv.service';
import { EducationsService } from './services/educations/educations.service';

@Module({
  controllers: [EducationsController, CvController],
  imports: [
    AuthenticationModule,
    CvConfigurationModule,
    PaginationModule,
    TypeOrmModule.forFeature([Education, Cv]),
    TypeOrmModule.forRootAsync({
      imports: [CvConfigurationModule],
      useFactory(postgresUri: string) {
        return {
          url: postgresUri,
          type: 'postgres',
          entities: [Education, Cv],
          synchronize: true
        };
      },
      inject: [POSTGRES_URI]
    })
  ],
  providers: [CvOpenapi, EducationsService, PermissionsService, CvService]
})
export class CvModule {}
