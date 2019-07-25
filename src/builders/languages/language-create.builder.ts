import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { LanguageLevel } from '../../domain/language-level.enum';
import { LanguageCreate } from '../../dto/language-create.dto';

export class LanguageCreateBuilder extends Builder<LanguageCreate> {
  withLanguage(language = this.faker.random.locale()): this {
    return this.with('language', language);
  }

  withLevel(level = LanguageLevel.Intermediate): this {
    return this.with('level', level);
  }

  withValidData(): this {
    return this.withLanguage().withLevel();
  }

  build(): LanguageCreate {
    return plainToClass(LanguageCreate, this.data);
  }
}

export function languageCreateBuilder() {
  return new LanguageCreateBuilder();
}
