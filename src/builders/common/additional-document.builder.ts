import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocument } from '../../domain/additional-document';

export class AdditionalDocumentBuilder extends Builder<AdditionalDocument> {
  withName(name = this.faker.lorem.sentence()): this {
    return this.with('name', name);
  }

  withUrl(url: string | null = this.faker.internet.url()): this {
    return this.with('url', url);
  }

  withValidData(): this {
    return this.withName().withUrl();
  }

  build(): AdditionalDocument {
    return plainToClass(AdditionalDocument, this.data);
  }
}

export function additionalDocumentBuilder() {
  return new AdditionalDocumentBuilder();
}
