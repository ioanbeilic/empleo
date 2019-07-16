import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'empleo-nestjs-authentication';
import { PaginationModule } from 'empleo-nestjs-common';
import { AppConfigurationModule } from 'src/configuration/app.configuration.module';
import { EducationsController } from 'src/controllers/educations/educations.controller';
import { POSTGRES_URI } from '../app.keys';
import { Education } from '../entities/education.entity';
import { EducationsService } from '../services/educations/educations.service';

@Module({
  exports: [EducationsService, AppConfigurationModule],
  providers: [EducationsService],
  imports: [
    HttpModule,
    AuthenticationModule,
    AppConfigurationModule,
    PaginationModule,
    TypeOrmModule.forFeature([Education], 'educations'),
    TypeOrmModule.forRootAsync({
      name: 'educations',
      imports: [AppConfigurationModule],
      useFactory(postgresUri: string) {
        return {
          url: postgresUri,
          name: 'educations',
          type: 'postgres',
          entities: [Education],
          synchronize: true
        };
      },
      inject: [POSTGRES_URI]
    })
  ],
  controllers: [EducationsController]
})
export class EducationsModule {}
