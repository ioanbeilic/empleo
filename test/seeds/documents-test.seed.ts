import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NamedSeed } from 'empleo-nestjs-common';
import { getEnv } from 'empleo-nestjs-testing';
import { Repository } from 'typeorm';
import { CvConfigurationService } from '../../src/configuration/cv-configuration.service';
import { Document } from '../../src/entities/document.entity';

@Injectable()
export class DocumentTestSeed extends NamedSeed {
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly cvConfigurationService: CvConfigurationService,
    @InjectRepository(Document) private documentRepository: Repository<Document>
  ) {
    super();
  }

  private get candidateId() {
    return getEnv('KEYCLOAK_CANDIDATE_ID');
  }

  private get adminId() {
    return getEnv('KEYCLOAK_ADMIN_ID');
  }

  isEnabled(): boolean | Promise<boolean> {
    return this.cvConfigurationService.isTest;
  }

  async down(): Promise<void> {
    const candidateResponse = await this.documentRepository.delete({ keycloakId: this.candidateId });
    const adminResponse = await this.documentRepository.delete({ keycloakId: this.adminId });

    if (candidateResponse.affected) {
      this.logger.debug(`removed document for user: ${this.candidateId}`);
    }
    if (adminResponse.affected) {
      this.logger.debug(`removed document for admin: ${this.adminId}`);
    }
  }
}
