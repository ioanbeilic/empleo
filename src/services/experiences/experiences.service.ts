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
  constructor(
    @InjectRepository(Experience) private readonly experienceRepository: Repository<Experience>,
    private readonly cvService: CvService
  ) {}

  /**
   * create a experience for user
   * @param user
   * @param experience
   * create de cv if don`t exist with method ensureExists
   * return the created experience
   *
   * @example
   *
   * ```ts
   *
   * export class DemoCreateExperience {
   *  constructor(private readonly experiencesService: ExperiencesService) {}
   *
   *  @Post()
   *  async create(
   *    @AuthenticatedUser() user: User,
   *    @Body() experience: ExperienceCreate
   *  ): Promise<Experience> {
   *    return this.experiencesService.createExperience({ user, experience });
   *  }
   *
   * ```
   *
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
   * find experience by user and experienceId
   * @param experienceId
   * @param user
   * trow a not found exception when the experience don`t exist or not belong to logged user
   * return the experience
   *
   * @example
   *
   * ```ts
   *
   * export class DemoFindUserExperienceById {
   *  constructor(private readonly experiencesService: ExperiencesService) {}
   *
   *  @Get()
   *  async findUserExperienceById(
   *    @AuthenticatedUser() user: User,
   *  ): Promise<Experience> {
   *    return this.experiencesService.findUserExperienceById({ experienceId, user });
   *  }
   * }
   *
   * ```
   */
  async findUserExperienceById({ experienceId, user }: { experienceId: ExperienceId; user: User }): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({ experienceId, keycloakId: user.id });

    if (!experience) {
      throw new ExperienceNotFoundException();
    }

    return experience;
  }

  /**
   * update a experience
   * @param experience experience that will be updated
   * @param update experience to which it is updated
   *
   * @example
   *
   * ```ts
   *
   * export class DemoCreateExperience {
   *  constructor(private readonly experiencesService: ExperiencesService) {}
   *
   *  @Put()
   *  async updateExperience(
   *    @AuthenticatedUser() user: User,
   *    @Body() update: ExperienceCreate,
   *    @Param() { experienceId, keycloakId }: FindOneParamsExperience
   *  ): Promise<void> {
   *    const experience = await this.experiencesService.findUserExperienceById({ experienceId, user });
   *    await this.experiencesService.updateOne({ experience, update });
   *  }
   * }
   *
   * ```
   *
   */
  async updateOne({ experience, update }: UpdateExperienceOptions): Promise<void> {
    await this.experienceRepository.update({ experienceId: experience.experienceId }, update);
  }

  /**
   * delete a experience with user and id
   * @param user
   * @param experienceId
   * trow not found exception if experience don`t exist or not belong to the user
   *
   * @example
   *
   * ```ts
   *
   * export class DemoCreateExperience {
   *  constructor(private readonly experiencesService: ExperiencesService) {}
   *
   *  @Delete()
   *  async deleteOneExperience(
   *    @AuthenticatedUser() user: User,
   *    @Param() { experienceId, keycloakId }: FindOneParamsExperience
   *  ): Promise<void> {
   *    await this.experiencesService.deleteOne({ user, experienceId });
   *  }
   * }
   *
   * ```
   */
  async deleteOne({ user, experienceId }: DeleteExperienceOptions) {
    const { affected } = await this.experienceRepository.delete({ experienceId, keycloakId: user.id });

    if (!affected) {
      throw new ExperienceNotFoundException();
    }
  }
}

export interface CreateExperienceOptions {
  /**
   * user type of User entity
   * experienceCreate type of ExperienceCreate dto
   */
  user: User;
  experience: ExperienceCreate;
}

export interface UpdateExperienceOptions {
  /**
   * experience type of Experience entity
   * update type of ExperienceCreate dto
   */
  experience: Experience;
  update: ExperienceCreate;
}

export interface DeleteExperienceOptions {
  /**
   * experience type of User entity
   * experienceId string
   */
  user: User;
  experienceId: string;
}
