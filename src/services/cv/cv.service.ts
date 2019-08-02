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
  /**
   *
   * @param cvRepository - repository for entity Cv
   */
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  /**
   * create a cv if not exist
   * @param keycloakId - logged in user id
   * if cv exist ignore uniq key violation with isUniqueKeyViolationError
   */
  async ensureExists(keycloakId: string): Promise<void> {
    try {
      await this.cvRepository.save({ cvId: uuid(), keycloakId });
    } catch (err) {
      if (!isUniqueKeyViolationError(err)) {
        throw err;
      }
    }
  }

  /**
   * method to find a cv by keycloakId, only for logged in users
   * @param user - the user for which you want to find the cv
   * trow not found exception if cv not exist
   * return the cv with all details - experiences, educations, documents, language
   */
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

  /**
   * delete the cv for logged in in user
   * @param keycloakId - logged in user id
   * cacade delete for cv , experiences, educations, languages, documents,
   * trow not found exception if user not have a cv
   */
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
