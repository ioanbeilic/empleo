import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Document } from '../../entities/document.entity';

export class DocumentBuilder extends Builder<Document> {
  withDocumentId(documentId = this.faker.random.uuid()): this {
    return this.with('documentId', documentId);
  }

  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

  withName(name = this.faker.lorem.sentence()): this {
    return this.with('name', name);
  }

  withUrl(url = this.faker.internet.url()): this {
    return this.with('url', url);
  }

  withoutDocumentId() {
    return this.without('documentId');
  }

  withValidData(): this {
    return this.withDocumentId()
      .withKeycloakId()
      .withName()
      .withUrl();
  }

  build(): Document {
    return plainToClass(Document, this.data);
  }
}

export function documentBuilder() {
  return new DocumentBuilder();
}
