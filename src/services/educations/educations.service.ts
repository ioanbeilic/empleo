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
  constructor(
    @InjectRepository(Education) private readonly educationRepository: Repository<Education>,
    private readonly cvService: CvService
  ) {}

  async createEducation({ user, education: educationCreate }: CreateEducationOptions): Promise<Education> {
    const education = await this.educationRepository.create({
      ...educationCreate,
      educationId: uuid(),
      keycloakId: user.id
    });

    this.cvService.createCv(user.id);
    return this.educationRepository.save(education);
  }

  async findUserEducationById({ educationId, user }: { educationId: EducationId; user: User }): Promise<Education> {
    const education = await this.educationRepository.findOne({ educationId, keycloakId: user.id });

    if (!education) {
      throw new EducationNotFoundException();
    }

    return education;
  }

  async updateOne({ education, update }: UpdateEducationOptions): Promise<void> {
    await this.educationRepository.update({ educationId: education.educationId }, update);
  }

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
