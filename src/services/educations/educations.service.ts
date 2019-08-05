import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education, EducationId } from '../../entities/education.entity';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class EducationsService {
  constructor(
    @InjectRepository(Education) private readonly educationRepository: Repository<Education>,
    private readonly cvService: CvService
  ) {}

  /**
   * create a education for user
   * @param  user
   * @param education:
   * create de cv if don`t exist with method ensureExists
   * return the created education
   *
   * @example
   *
   * ```ts
   *
   * export class DemoCreateEducation {
   *  constructor(private readonly educationsService: EducationsService {}
   *
   *  @Post()
   *  async demoCreateEducation(
   *    @AuthenticatedUser() user: User,
   *    @Body() education: EducationCreate
   *  ): Promise<Education> {
   *    return this.educationsService.createEducation({ user, education });
   *  }
   * }
   *
   * ```
   */
  async createEducation({ user, education: educationCreate }: CreateEducationOptions): Promise<Education> {
    const education = await this.educationRepository.create({
      ...educationCreate,
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.educationRepository.save(education);
  }

  /**
   * find education by id and user
   * @param  educationId
   * @param  user
   * trow a not found exception when the education don`t exist or not belong to logged user
   * return the education
   *
   * @example
   *
   * ```ts
   *
   * export class demoFindUserEducationById {
   *  constructor(private readonly educationsService: EducationsService) {}
   *
   *  @Get()
   *  async create(
   *    @AuthenticatedUser() user: User,
   *  ): Promise<Education> {
   *    return this.educationsService.createEducation({ user, education });
   *  }
   * }
   *
   * ```
   */
  async findUserEducationById({ educationId, user }: { educationId: EducationId; user: User }): Promise<Education> {
    const education = await this.educationRepository.findOne({ educationId, keycloakId: user.id });

    if (!education) {
      throw new EducationNotFoundException();
    }

    return education;
  }

  /**
   * update a education by user and educationId
   * @param education experience that will be updated
   * @param update education to which it is updated
   *
   * @example
   *
   * ```ts
   *
   * export class demoUpdateEducation {
   *  constructor(private readonly educationsService: EducationsService {}
   *
   *    @Put()
   *    async updateEducation(
   *      @AuthenticatedUser() user: User,
   *      @Body() update: EducationCreate,
   *      @Param() { educationId, keycloakId }: FindOneParamsEducation
   *    ): Promise<void> {
   *      const education = await this.educationsService.findUserEducationById({ educationId, user });
   *      await this.educationsService.updateOne({ education, update });
   *    }
   *
   * }
   *
   * ```
   */
  async updateOne({ education, update }: UpdateEducationOptions): Promise<void> {
    await this.educationRepository.update({ educationId: education.educationId }, update);
  }

  /**
   * delete a education with user and educationId
   * @param  user
   * @param educationId
   * trow not found exception if education don`t exist or not belong to the user
   *
   * @example
   *
   * ```ts
   *
   * export class demoDeleteOne {
   *  constructor(private readonly educationsService: EducationsService {}
   *
   *  @Delete()
   *  async deleteOneEducation(
   *                              @AuthenticatedUser() user: User,
   *                              @Param() { educationId, keycloakId }: FindOneParamsEducation
   *                          ): Promise<void> {
   *    await this.educationsService.deleteOne({ user, educationId });
   *  }
   * }
   * ```
   */
  async deleteOne({ user, educationId }: DeleteEducationOptions) {
    const { affected } = await this.educationRepository.delete({ educationId, keycloakId: user.id });

    if (!affected) {
      throw new EducationNotFoundException();
    }
  }
}

export interface CreateEducationOptions {
  /**
   * user type of User entity
   * education type of EducationCreate dto
   */
  user: User;
  education: EducationCreate;
}

export interface UpdateEducationOptions {
  /**
   * education type of Education entity
   * update type of EducationCreate dto
   */
  education: Education;
  update: EducationCreate;
}

export interface DeleteEducationOptions {
  /**
   * user type of User entity
   * educationId string
   */
  user: User;
  educationId: string;
}
