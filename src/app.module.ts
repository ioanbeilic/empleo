import { Module } from '@nestjs/common';
import { EducationsModule } from './modules/educations.module';

@Module({
  imports: [EducationsModule]
})
export class AppModule {}
