import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { DocumentationCreate } from '../../dto/documentation-create.dto';

export class DocumentationCreateBuilder extends Builder<DocumentationCreate> {
  withName(name = this.faker.lorem.sentence()): this {
    return this.with('name', name);
  }

  withUrl(url: string | null = this.faker.internet.url()): this {
    return this.with('url', url);
  }

  withValidData(): this {
    return this.withName().withUrl();
  }

  build(): DocumentationCreate {
    return plainToClass(DocumentationCreate, this.data);
  }
}

export function documentationCreateBuilder() {
  return new DocumentationCreateBuilder();
}
