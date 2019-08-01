import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { LanguageLevel } from '../../domain/language-level.enum';
import { Language } from '../../entities/language.entity';

export class LanguageBuilder extends Builder<Language> {
  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

  withLanguage(language = this.faker.random.locale()): this {
    return this.with('language', language);
  }

  withLevel(level = LanguageLevel.Intermediate): this {
    return this.with('level', level);
  }

  withValidData(): this {
    return this.withKeycloakId()
      .withLanguage()
      .withLevel();
  }

  withoutLanguageId() {
    return this.without('languageId');
  }

  build(): Language {
    return plainToClass(Language, this.data);
  }
}

export function languageBuilder() {
  return new LanguageBuilder();
}
