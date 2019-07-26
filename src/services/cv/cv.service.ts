import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUniqueKeyViolationError } from 'empleo-nestjs-common';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { Cv } from '../../entities/cv.entity';
import { Documentation } from '../../entities/documentation.entity';
import { Education } from '../../entities/education.entity';
import { Experience } from '../../entities/experience.entity';
import { Language } from '../../entities/language.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';

@Injectable()
export class CvService {
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  async ensureExists({ keycloakId }: CvOptions): Promise<void> {
    try {
      await this.cvRepository.save({ cvId: uuid(), keycloakId });
    } catch (err) {
      if (!isUniqueKeyViolationError(err)) {
        throw err;
      }
    }
  }

  async findByUser({ keycloakId }: CvOptions): Promise<ResponseCvOption | undefined> {
    const response = await this.cvRepository.findOne(
      {
        keycloakId
      },
      { relations: ['educations', 'experiences', 'languages', 'documentations'] }
    );

    if (response === undefined) {
      throw new CvNotFoundException();
    }

    return response;
  }

  async deleteOne({ keycloakId }: CvOptions) {
    const { affected } = await this.cvRepository.delete({ keycloakId });

    if (!affected) {
      throw new CvNotFoundException();
    }
  }
}

export interface CvOptions {
  keycloakId: string;
}

export interface ResponseCvOption extends Cv {
  cvId: string;
  educations: Education[];
  experiences: Experience[];
  languages: Language[];
  documentations: Documentation[];
}
