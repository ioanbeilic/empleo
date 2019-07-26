import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocumentation } from '../../domain/additional-documentation';

export class AdditionalDocumentationBuilder extends Builder<AdditionalDocumentation> {
  withName(name = this.faker.lorem.sentence()): this {
    return this.with('name', name);
  }

  withUrl(url: string | null = this.faker.internet.url()): this {
    return this.with('url', url);
  }

  withValidData(): this {
    return this.withName().withUrl();
  }

  build(): AdditionalDocumentation {
    return plainToClass(AdditionalDocumentation, this.data);
  }
}

export function additionalDocumentationBuilder() {
  return new AdditionalDocumentationBuilder();
}
