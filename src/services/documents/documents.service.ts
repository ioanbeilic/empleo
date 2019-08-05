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
  constructor(
    @InjectRepository(Document) private readonly documentRepository: Repository<Document>,
    private readonly cvService: CvService
  ) {}

  /**
   * create a user document
   * @param user
   * @param document
   * create de cv if don`t exist with method ensureExists
   * return the created document
   *
   * @example
   *
   * ```ts
   *
   * export class DemoCreateDocument {
   *  constructor(private readonly documentsService: DocumentsService {}
   *
   *  @Post()
   *  async demoCreateDocument(
   *    @AuthenticatedUser() user: User,
   *    @Body() document: DocumentCreate
   *  ): Promise<Document> {
   *    return this.documentsService.createDocument({ user, document });
   *  }
   *
   * }
   *
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
   * delete a document with user and id
   * @param user
   * @param documentId
   * trow not found exception if document don`t exist or not belong to the user
   *
   * @example
   *
   * ```ts
   *
   * export class demoDeleteOne {
   *  constructor(private readonly documentsService: DocumentsService {}
   *
   *  @Delete()
   *  async deleteOneDocument(@AuthenticatedUser() user: User, @Param() { documentId, keycloakId }: FindOneParamsDocument): Promise<void> {
   *    await this.documentsService.deleteOne({ user, documentId });
   *  }
   * }
   * ```
   */
  async deleteOne({ user, documentId }: DeleteDocumentOptions) {
    const { affected } = await this.documentRepository.delete({ documentId, keycloakId: user.id });

    if (!affected) {
      throw new DocumentNotFoundException();
    }
  }
}

export interface CreateDocumentOptions {
  /**
   * user type of entity User
   * document type of dto DocumentCreate
   */
  user: User;
  document: DocumentCreate;
}

export interface DeleteDocumentOptions {
  /**
   * user type of entity User
   * documentId string type UUID
   */
  user: User;
  documentId: string;
}
