import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import uuid from 'uuid/v4';
import { Cv } from '../../entities/cv.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';

function isUniqueKeyViolationError(err: Error & { code?: string }) {
  return err instanceof QueryFailedError && err.code === '23505';
}

@Injectable()
export class CvService {
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  async createCv(keycloakId: string): Promise<void | never> {
    const cv = await this.cvRepository.create({ cvId: uuid(), keycloakId });

    try {
      await this.cvRepository.save(cv);
    } catch (err) {
      if (!isUniqueKeyViolationError(err)) {
        throw err;
      }
    }
  }

  async deleteOne(keycloakId: string) {
    const { affected } = await this.cvRepository.delete({ keycloakId });

    if (!affected) {
      throw new CvNotFoundException();
    }
  }
}
