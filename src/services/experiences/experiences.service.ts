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

  async createExperience({ user, experience: experienceCreate }: CreateExperienceOptions): Promise<Experience> {
    const experience = this.experienceRepository.create({
      ...experienceCreate,
      experienceId: uuid(),
      keycloakId: user.id
    });

    return this.experienceRepository.save(experience);
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

  async deleteOne({ user, experienceId }: DeleteExperienceOptions) {
    const { affected } = await this.experienceRepository.delete({ experienceId, keycloakId: user.id });

    if (!affected) {
      throw new ExperienceNotFoundException();
    }
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

export interface DeleteExperienceOptions {
  user: User;
  experienceId: string;
}
