import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { LanguageCreate } from '../../dto/language-create.dto';
import { Language, LanguageId } from '../../entities/language.entity';
import { LanguageNotFoundException } from '../../errors/language-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class LanguagesService {
  /**
   *
   * @param languageRepository - repository for entity language
   * @param cvService - dependency injection to create a new cv if not exist with method  ensureExists
   */
  constructor(
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly cvService: CvService
  ) {}

  /**
   * create/add new language to a cv
   * If cv don`t exist is created
   * @param { user, language: languageCreate } where user is loggedIn user ans language is form data from front side
   */
  async createLanguage({ user, language: languageCreate }: CreateLanguageOptions): Promise<Language> {
    const language = this.languageRepository.create({
      ...languageCreate,
      languageId: uuid(),
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.languageRepository.save(language);
  }

  /**
   * find a specific language by id
   * @param { languageId, user } - language id and logged user
   */
  async findUserLanguageById({ languageId, user }: { languageId: LanguageId; user: User }): Promise<Language> {
    const language = await this.languageRepository.findOne({ languageId, keycloakId: user.id });

    if (!language) {
      throw new LanguageNotFoundException();
    }

    return language;
  }

  /**
   * update a existing language
   * @param { languageId, user } - language id and logged user
   */
  async updateOne({ language, update }: UpdateLanguageOptions): Promise<void> {
    await this.languageRepository.update({ languageId: language.languageId }, update);
  }

  /**
   * delete language if the language belong to the user
   * @param { languageId, user } - language id and logged user
   * return 404 language not found if the language not exist or don`t belong to the user
   */
  async deleteOne({ user, languageId }: DeleteLanguageOptions) {
    const { affected } = await this.languageRepository.delete({ languageId, keycloakId: user.id });

    if (!affected) {
      throw new LanguageNotFoundException();
    }
  }
}

export interface CreateLanguageOptions {
  user: User;
  language: LanguageCreate;
}

export interface UpdateLanguageOptions {
  language: Language;
  update: LanguageCreate;
}

export interface DeleteLanguageOptions {
  user: User;
  languageId: string;
}
