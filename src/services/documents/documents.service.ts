import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import { DocumentCreate } from '../../dto/document-create.dto';
import { Document } from '../../entities/document.entity';
import { DocumentNotFoundException } from '../../errors/documents-not-found.exception';
import { CvService } from '../cv/cv.service';

@Injectable()
export class DocumentsService {
  /**
   *
   * @param documentRepository - repository for entity Document
   * @param cvService - dependency injection to create a new cv if not exist with method  ensureExists
   */
  constructor(
    @InjectRepository(Document) private readonly documentRepository: Repository<Document>,
    private readonly cvService: CvService
  ) {}

  /**
   * create a document for logged in user
   * @param { user, document: documentCreate } - user = logged user, documentCreate = form data from front as DocumentCreate model
   * create de cv if don`t exist with method ensureExists
   * return the created document
   */
  async createDocument({ user, document: documentCreate }: CreateDocumentOptions): Promise<Document> {
    const document = this.documentRepository.create({
      ...documentCreate,
      keycloakId: user.id
    });

    await this.cvService.ensureExists(user.id);

    return this.documentRepository.save(document);
  }

  /**
   * delete a document for logged in user
   * @param { user, documentId } - user =  logged in user, documentId = id of document to delete
   * trow not found exception if document don`t exist or not belong to the user
   */
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
