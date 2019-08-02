import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v4';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education, EducationId } from '../../entities/education.entity';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class EducationsService {
  /**
   *
   * @param educationRepository - repository for entity Education
   * @param cvService - dependency injection to create a new cv if not exist with method  ensureExists
   */
  constructor(
    @InjectRepository(Education) private readonly educationRepository: Repository<Education>,
    private readonly cvService: CvService
  ) {}

  /**
   * create a education for logged in user
   * @param { user, education: educationCreate } - user = logged user, educationCreate = form data from front as EducationCreate model
   * create de cv if don`t exist with method ensureExists
   * return the created education
   */
  async createEducation({ user, education: educationCreate }: CreateEducationOptions): Promise<Education> {
    const education = await this.educationRepository.create({
      ...educationCreate,
      educationId: uuid(),
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.educationRepository.save(education);
  }

  /**
   * find user education by id for logged in user
   * @param { educationId, user } - educationId = id of education, user = logged in user
   * trow a not found exception when the education don`t exist or not belong to logged user
   * return the education
   */
  async findUserEducationById({ educationId, user }: { educationId: EducationId; user: User }): Promise<Education> {
    const education = await this.educationRepository.findOne({ educationId, keycloakId: user.id });

    if (!education) {
      throw new EducationNotFoundException();
    }

    return education;
  }

  /**
   * update a education for logged in user
   * @param { education, update } - education = old education, update = new education
   */
  async updateOne({ education, update }: UpdateEducationOptions): Promise<void> {
    await this.educationRepository.update({ educationId: education.educationId }, update);
  }

  /**
   * delete a education for logged in user
   * @param { user, educationId } - user =  logged in user, educationId = id of education to delete
   * trow not found exception if education don`t exist or not belong to the user
   */
  async deleteOne({ user, educationId }: DeleteEducationOptions) {
    const { affected } = await this.educationRepository.delete({ educationId, keycloakId: user.id });

    if (!affected) {
      throw new EducationNotFoundException();
    }
  }
}

export interface CreateEducationOptions {
  user: User;
  education: EducationCreate;
}

export interface UpdateEducationOptions {
  education: Education;
  update: EducationCreate;
}

export interface DeleteEducationOptions {
  user: User;
  educationId: string;
}
