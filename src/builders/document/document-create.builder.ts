import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { DocumentCreate } from '../../dto/document-create.dto';

export class DocumentCreateBuilder extends Builder<DocumentCreate> {
  withName(name = this.faker.lorem.sentence()): this {
    return this.with('name', name);
  }

  withUrl(url: string | null = this.faker.internet.url()): this {
    return this.with('url', url);
  }

  withoutName() {
    return this.without('name');
  }

  withValidData(): this {
    return this.withName().withUrl();
  }

  build(): DocumentCreate {
    return plainToClass(DocumentCreate, this.data);
  }
}

export function documentCreateBuilder() {
  return new DocumentCreateBuilder();
}
