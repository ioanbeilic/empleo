import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUniqueKeyViolationError } from 'empleo-nestjs-common';
import { Repository } from 'typeorm';
import { Cv } from '../../entities/cv.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';

@Injectable()
export class CvService {
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  async ensureExists(keycloakId: string): Promise<void> {
    try {
      const cv = await this.cvRepository.create({ keycloakId });
      await this.cvRepository.save(cv);
    } catch (err) {
      if (!isUniqueKeyViolationError(err)) {
        throw err;
      }
    }
  }

  async findByKeycloakId(keycloakId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({ keycloakId }, { relations: ['educations', 'experiences', 'languages', 'documents'] });

    if (!cv) {
      throw new CvNotFoundException();
    }

    return cv;
  }

  async deleteOne(keycloakId: string) {
    const { affected } = await this.cvRepository.delete({ keycloakId });

    if (!affected) {
      throw new CvNotFoundException();
    }
  }
}

export interface CvOptions {
  keycloakId: string;
}
