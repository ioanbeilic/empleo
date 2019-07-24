import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Language } from '../../entities/language.entity';

export class LanguageBuilder extends Builder<Language> {
  withExperienceId(languageId = this.faker.random.uuid()): this {
    return this.with('languageId', languageId);
  }

  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

  withLanguage(language = this.faker.random.word()): this {
    return this.with('language', language);
  }

  withLevel(level = this.faker.random.number(5)): this {
    return this.with('level', level);
  }

  withValidData(): this {
    return this.withLanguage().withLevel();
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
