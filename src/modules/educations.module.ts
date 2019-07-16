import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationsController } from 'src/modules/controllers/educations/educations.controller';
import { Education } from './entities/education.entity';
import { EducationsService } from './services/educations/educations.service';

@Module({
  exports: [EducationsService],
  providers: [EducationsService],
  controllers: [EducationsController],
  imports: [TypeOrmModule.forFeature([Education])]
})
export class EducationsModule {}
