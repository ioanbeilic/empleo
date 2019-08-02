import { NestApplication } from '@nestjs/core';
import { Api } from 'empleo-nestjs-testing';
import { LanguageCreate } from '../../src/dto/language-create.dto';
import { Language } from '../../src/entities/language.entity';

export class LanguagesApi extends Api<Language, LanguageCreate> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }
}
