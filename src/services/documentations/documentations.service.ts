import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'empleo-nestjs-authentication';
import { Repository } from 'typeorm';
import uuid from 'uuid/v1';
import { DocumentationCreate } from '../../dto/documentation-create.dto';
import { Documentation } from '../../entities/documentation.entity';
import { CvService } from '../cv/cv.service';

@Injectable()
export class DocumentationsService {
  constructor(
    @InjectRepository(Documentation) private readonly documentationRepository: Repository<Documentation>,
    private readonly cvService: CvService
  ) {}

  async createDocumentation({ user, documentation: documentationCreate }: CreateDocumentationOptions): Promise<Documentation> {
    const documentation = this.documentationRepository.create({
      ...documentationCreate,
      documentationId: uuid(),
      keycloakId: user.id
    });

    await this.cvService.ensureExists({ keycloakId: user.id });

    return this.documentationRepository.save(documentation);
  }
}

export interface CreateDocumentationOptions {
  user: User;
  documentation: DocumentationCreate;
}
