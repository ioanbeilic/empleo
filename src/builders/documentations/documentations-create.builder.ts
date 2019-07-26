import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Documentation } from '../../entities/documentation.entity';

export class DocumentationCreateBuilder extends Builder<Documentation> {
  withName(name = this.faker.lorem.sentence()): this {
    return this.with('name', name);
  }

  withUrl(url: string | null = this.faker.internet.url()): this {
    return this.with('url', url);
  }

  withValidData(): this {
    return this.withName().withUrl();
  }

  build(): Documentation {
    return plainToClass(Documentation, this.data);
  }
}

export function documentationCreateBuilder() {
  return new DocumentationCreateBuilder();
}