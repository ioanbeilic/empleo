import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUniqueKeyViolationError } from 'empleo-nestjs-common';
import { Repository } from 'typeorm';
import { Cv } from '../../entities/cv.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';

@Injectable()
export class CvService {
  constructor(@InjectRepository(Cv) private readonly cvRepository: Repository<Cv>) {}

  /**
   * Create a cv if not exist
   * @param keycloakId
   * if cv exist ignore uniq key violation with isUniqueKeyViolationError
   *
   * @example
   *
   * ```ts
   *
   * export class DemoEnsureExists {
   *  constructor(private readonly cvService: CvService) {}
   *
   *  @Get()
   *  @Authorize.Candidates()
   *  @ApiKeycloakIdParam()
   *  async create(
   *    @Param() { keycloakId }: KeycloakIdParams,
   *  ): void {
   *    await this.cvService.ensureExists(keycloakId);
   *  }
   * }
   *
   * ```
   */
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

  /**
   * method to find a cv by keycloakId, only for logged in users
   * @param keycloakId - the user for which you want to find the cv
   * trow not found exception if cv not exist
   * return the cv with all details  experiences, educations, documents, language
   *
   * @example
   *
   * ```ts
   * import { Cv } from '../../entities/cv.entity';
   *
   * export class DemoFindByKeycloakId {
   *  constructor(private readonly cvService: CvService) {}
   *
   *    @Get()
   *    @Authorize.Candidates()
   *    @ApiKeycloakIdParam()
   *    async controllerFindByKeycloakId(
   *        @Param() { keycloakId }: KeycloakIdParams,
   *    ): Promise<Cv> {
   *        await this.cvService.findByKeycloakId(keycloakId);
   *    }
   * }
   *
   * ```
   */
  async findByKeycloakId(keycloakId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({ keycloakId }, { relations: ['educations', 'experiences', 'languages', 'documents'] });

    if (!cv) {
      throw new CvNotFoundException();
    }

    return cv;
  }

  /**
   * delete the cv for logged in in user
   * @param keycloakId keycloakId:string
   * cascade delete for cv , experiences, educations, languages, documents,
   * trow not found exception if user not have a cv
   *
   * @example
   *
   * ```ts
   * export class DemoDeleteOne {
   *   constructor(private readonly cvService: CvService) {}
   *
   *   @Delete()
   *   @Authorize.Candidates()
   *   @ApiKeycloakIdParam()
   *   async controllerDeleteOne(
   *   @Param() { keycloakId }: KeycloakIdParams,
   *   ): void {
   *      await this.cvService.deleteOne(keycloakId);
   *   }
   * }
   *
   * ```
   */
  async deleteOne(keycloakId: string) {
    const { affected } = await this.cvRepository.delete({ keycloakId });

    if (!affected) {
      throw new CvNotFoundException();
    }
  }
}
