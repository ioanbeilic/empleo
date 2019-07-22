import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience } from '../../entities/experience.entity';

@Injectable()
export class ExperiencesService {
  constructor(@InjectRepository(Experience) private readonly experienceRepository: Repository<Experience>) {}

  async createExperience({ user, experience: experienceCreate }: CreateExperienceOptions): Promise<Experience> {
    const experience = this.experienceRepository.create({
      ...experienceCreate,
      experienceId: uuid(),
      keycloakId: user.id
    });

    return this.experienceRepository.save(experience);
  }
}

export interface CreateExperienceOptions {
  user: User;
  experience: ExperienceCreate;
}