import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { LanguageCreate } from '../../dto/language-create.dto';

export class LanguageCreateBuilder extends Builder<LanguageCreate> {
  withLanguage(language = this.faker.random.word()): this {
    return this.with('language', language);
  }

  withLevel(level = this.faker.random.number(5)): this {
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
