import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { DocumentCreate } from '../../dto/document-create.dto';
import { Document } from '../../entities/document.entity';
import { DocumentNotFoundException } from '../../errors/documents-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly documentRepository: Repository<Document>,
    private readonly cvService: CvService
  ) {}

  async createDocument({ user, document: documentCreate }: CreateDocumentOptions): Promise<Document> {
    const document = this.documentRepository.create({
      ...documentCreate,
      documentId: uuid(),
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.documentRepository.save(document);
  }

  async deleteOne({ user, documentId }: DeleteDocumentOptions) {
    const { affected } = await this.documentRepository.delete({ documentId, keycloakId: user.id });

    if (!affected) {
      throw new DocumentNotFoundException();
    }
  }
}

export interface CreateDocumentOptions {
  user: User;
  document: DocumentCreate;
}

export interface DeleteDocumentOptions {
  user: User;
  documentId: string;
}
