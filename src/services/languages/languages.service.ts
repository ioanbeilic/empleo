import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { LanguageCreate } from '../../dto/language-create.dto';
import { Language } from '../../entities/language.entity';

@Injectable()
export class LanguagesService {
  constructor(@InjectRepository(Language) private readonly languageRepository: Repository<Language>) {}

  async createLanguage({ user, language: languageCreate }: CreateLanguageOptions): Promise<Language> {
    const language = this.languageRepository.create({
      ...languageCreate,
      languageId: uuid(),
      keycloakId: user.id
    });

    return this.languageRepository.save(language);
  }
}

export interface CreateLanguageOptions {
  user: User;
  language: LanguageCreate;
}
