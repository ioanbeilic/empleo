import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience, ExperienceId } from '../../entities/experience.entity';
import { ExperienceNotFoundException } from '../../errors/experience-not-found.exception';

@Injectable()
export class ExperiencesService {
  constructor(@InjectRepository(Experience) private readonly experienceRepository: Repository<Experience>) {}

  async createExperience({ user, experience }: CreateExperienceOptions): Promise<Experience> {
    const newExperience = this.experienceRepository.create({
      ...experience,
      experienceId: uuid(),
      keycloakId: user.id
    });

    return await this.saveExperience(newExperience);
  }

  async findUserExperienceById({ experienceId, user }: { experienceId: ExperienceId; user: User }): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({ experienceId, keycloakId: user.id });

    if (!experience) {
      throw new ExperienceNotFoundException();
    }

    return experience;
  }

  async updateOne({ experience, update }: UpdateExperienceOptions): Promise<void> {
    await this.experienceRepository.update({ experienceId: experience.experienceId }, update);
  }

  private async saveExperience(experience: Experience): Promise<Experience> {
    return await this.experienceRepository.save(experience);
  }
}

export interface CreateExperienceOptions {
  user: User;
  experience: ExperienceCreate;
}

export interface UpdateExperienceOptions {
  experience: Experience;
  update: ExperienceCreate;
}
