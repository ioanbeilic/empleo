import { NestApplication } from '@nestjs/core';
import { Api } from 'empleo-nestjs-testing';
import { DocumentationCreate } from '../../src/dto/documentation-create.dto';
import { Documentation } from '../../src/entities/documentation.entity';

export class DocumentationsApi extends Api<Documentation, DocumentationCreate> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }
}
