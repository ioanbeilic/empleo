import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education } from '../../entities/education.entity';

@Injectable()
export class EducationsService {
  constructor(@InjectRepository(Education) private readonly educationRepository: Repository<Education>) {}

  async createEducation({ user, education: educationCreate }: CreateEducationOptions): Promise<Education> {
    const education = await this.educationRepository.create({
      ...educationCreate,
      educationId: uuid(),
      keycloakId: user.id
    });

    return this.educationRepository.save(education);
  }
}

export interface CreateEducationOptions {
  user: User;
  education: EducationCreate;
}
