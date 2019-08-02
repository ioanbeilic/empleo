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

  async createLanguage({ user, language: languageCreate }: CreateLanguageOptions): Promise<Language> {
    const language = this.languageRepository.create({
      ...languageCreate,
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.languageRepository.save(language);
  }

  async findUserLanguageById({ languageId, user }: { languageId: LanguageId; user: User }): Promise<Language> {
    const language = await this.languageRepository.findOne({ languageId, keycloakId: user.id });

    if (!language) {
      throw new LanguageNotFoundException();
    }

    return language;
  }

  async updateOne({ language, update }: UpdateLanguageOptions): Promise<void> {
    await this.languageRepository.update({ languageId: language.languageId }, update);
  }

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
