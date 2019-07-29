import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { isUniqueKeyViolationError } from 'empleo-nestjs-common';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { Cv } from '../../entities/cv.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';

@Injectable()
export class CvService {
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  async ensureExists(keycloakId: string): Promise<void> {
    try {
      await this.cvRepository.save({ cvId: uuid(), keycloakId });
    } catch (err) {
      if (!isUniqueKeyViolationError(err)) {
        throw err;
      }
    }
  }

  async findByUser(user: User): Promise<Cv> {
    const cv = await this.cvRepository.findOne(
      { keycloakId: user.id },
      { relations: ['educations', 'experiences', 'languages', 'documents'] }
    );

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
