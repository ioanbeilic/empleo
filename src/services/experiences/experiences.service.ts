import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { Experience, ExperienceId } from '../../entities/experience.entity';
import { ExperienceNotFoundException } from '../../errors/experience-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class ExperiencesService {
  /**
   *
   * @param experienceRepository - repository for entity Experience
   * @param cvService - dependency injection to create a new cv if not exist with method ensureExists
   */
  constructor(
    @InjectRepository(Experience) private readonly experienceRepository: Repository<Experience>,
    private readonly cvService: CvService
  ) {}

  /**
   * create a experience for logged in user
   * @param { user, experience: experienceCreate } - user = logged user, experienceCreate = form data from front as ExperienceCreate model
   * create de cv if don`t exist with method ensureExists
   * return the created experience
   */
  async createExperience({ user, experience: experienceCreate }: CreateExperienceOptions): Promise<Experience> {
    const experience = this.experienceRepository.create({
      ...experienceCreate,
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.experienceRepository.save(experience);
  }

  /**
   * find user experience by id for logged in user
   * @param { experienceId, user } - experienceId = id of experience, user = logged in user
   * trow a not found exception when the experience don`t exist or not belong to logged user
   * return the experience
   */
  async findUserExperienceById({ experienceId, user }: { experienceId: ExperienceId; user: User }): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({ experienceId, keycloakId: user.id });

    if (!experience) {
      throw new ExperienceNotFoundException();
    }

    return experience;
  }

  /**
   * update a experience for logged in user
   * @param { experience, update } - experience = old experience, update = new experience
   */
  async updateOne({ experience, update }: UpdateExperienceOptions): Promise<void> {
    await this.experienceRepository.update({ experienceId: experience.experienceId }, update);
  }

  /**
   * delete a experience for logged in user
   * @param { user, experienceId } - user =  logged in user, experienceId = id of experience to delete
   * trow not found exception if experience don`t exist or not belong to the user
   */
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
