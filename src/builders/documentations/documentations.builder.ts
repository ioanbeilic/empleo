import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Documentation } from '../../entities/documentation.entity';

export class DocumentationBuilder extends Builder<Documentation> {
  withDocumentationId(documentationId = this.faker.random.uuid()): this {
    return this.with('documentationId', documentationId);
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

  withoutDocumentationId() {
    return this.without('documentationId');
  }

  withValidData(): this {
    return this.withDocumentationId()
      .withKeycloakId()
      .withName()
      .withUrl();
  }

  build(): Documentation {
    return plainToClass(Documentation, this.data);
  }
}

export function documentationBuilder() {
  return new DocumentationBuilder();
}
