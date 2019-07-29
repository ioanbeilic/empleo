import { NestApplication } from '@nestjs/core';
import { Api } from 'empleo-nestjs-testing';
import { DocumentCreate } from '../../src/dto/document-create.dto';
import { Document } from '../../src/entities/document.entity';

export class DocumentsApi extends Api<Document, DocumentCreate> {
  constructor({ app, token, path }: { app: NestApplication; path: string; token?: string }) {
    super({
      server: app.getHttpServer(),
      endpoint: path,
      token
    });
  }
}
