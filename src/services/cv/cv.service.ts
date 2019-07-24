import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUniqueKeyViolationError } from 'empleo-nestjs-common';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { Cv } from '../../entities/cv.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';

@Injectable()
export class CvService {
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  async ensureExists({ keycloakId }: CreateCvOptions): Promise<void> {
    try {
      await this.cvRepository.save({ cvId: uuid(), keycloakId });
    } catch (err) {
      if (!isUniqueKeyViolationError(err)) {
        throw err;
      }
    }
  }

  async deleteOne({ keycloakId }: DeleteCvOptions) {
    const { affected } = await this.cvRepository.delete({ keycloakId });

    if (!affected) {
      throw new CvNotFoundException();
    }
  }
}

export interface CreateCvOptions {
  keycloakId: string;
}

export interface DeleteCvOptions {
  keycloakId: string;
}
