import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import { LanguageCreate } from '../../dto/language-create.dto';
import { Language, LanguageId } from '../../entities/language.entity';
import { LanguageNotFoundException } from '../../errors/language-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly cvService: CvService
  ) {}

  /**
   * create/add new language to a cv
   * If cv don`t exist is created
   * @param user user entity
   * @param language: languageCreate dto
   * crate the cv if not exist with method ensureExists from CvServices
   * return a created language
   *
   * @example
   *
   * ```ts
   *
   * import { LanguageCreate } from '../../dto/language-create.dto';
   * import { Language } from '../../entities/language.entity';
   * import { LanguagesService } from '../../services/languages/languages.service';
   *
   * export class DemoCreateLanguage {
   *  constructor(private readonly languagesService: LanguagesService) {}
   *
   *  @Post()
   *  async createLanguage(
   *     @AuthenticatedUser() user: User,
   *     @Body() language: LanguageCreate
   *   ): Promise<Language> {
   *     return this.languagesService.createLanguage({ user, language });
   *   }
   * }
   *
   * ```
   *
   */
  async createLanguage({ user, language: languageCreate }: CreateLanguageOptions): Promise<Language> {
    const language = this.languageRepository.create({
      ...languageCreate,
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.languageRepository.save(language);
  }

  /**
   * find a language by id and user
   * @param languageId
   * @param user
   * return Language
   *
   * @example
   *
   * ```ts
   *
   *  @Get()
   *  async demoFindUserLanguageById(
   *     @AuthenticatedUser() user: User,
   *     @Param() { languageId, keycloakId }: FindOneParamsLanguage
   *   ): Promise<Language> {
   *     return await this.languagesService.findUserLanguageById({ languageId, user });
   *   }
   *
   * ```
   */
  async findUserLanguageById({ languageId, user }: FindUserLanguageByIdOption): Promise<Language> {
    const language = await this.languageRepository.findOne({ languageId, keycloakId: user.id });

    if (!language) {
      throw new LanguageNotFoundException();
    }

    return language;
  }

  /**
   * update a existing language
   * @param language language that will be updated
   * @param update language to which it is updated
   *
   * @example
   *
   * ```ts
   *
   *  @Put()
   *  async updateLanguage(
   *    @Body() update: LanguageCreate,
   *  ): Promise<void> {
   *    const language = await this.languagesService.findUserLanguageById({ languageId, user });
   *    await this.languagesService.updateOne({ language, update });
   *  }
   *
   * ```
   */
  async updateOne({ language, update }: UpdateLanguageOptions): Promise<void> {
    await this.languageRepository.update({ languageId: language.languageId }, update);
  }

  /**
   * delete language if the language belong to the user
   * @param languageId,
   * @param  user
   * return 404 language not found if the language not exist or don`t belong to the user
   *
   * @example
   *
   * ```ts
   *
   *   @Delete()
   *   async deleteOneLanguage(
   *      @AuthenticatedUser() user: User,
   *      @Param() { languageId, keycloakId }: FindOneParamsLanguage
   *    ): Promise<void> {
   *       await this.languagesService.deleteOne({ user, languageId });
   *   }
   *
   * ```
   */
  async deleteOne({ user, languageId }: DeleteLanguageOptions) {
    const { affected } = await this.languageRepository.delete({ languageId, keycloakId: user.id });

    if (!affected) {
      throw new LanguageNotFoundException();
    }
  }
}

export interface CreateLanguageOptions {
  /**
   * user = User entity
   * language = LanguageCreate dto
   */
  user: User;
  language: LanguageCreate;
}

export interface UpdateLanguageOptions {
  /**
   * language = Language entity
   * update = LanguageCreate dto
   */
  language: Language;
  update: LanguageCreate;
}

export interface DeleteLanguageOptions {
  /**
   * user = User entity
   * languageId = string
   */
  user: User;
  languageId: string;
}

export interface FindUserLanguageByIdOption {
  /**
   * languageId = string
   * user = User entity
   */
  languageId: LanguageId;
  user: User;
}
