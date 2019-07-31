import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NamedSeed } from 'empleo-nestjs-common';
import { getEnv } from 'empleo-nestjs-testing';
import { Repository } from 'typeorm';
import { CvConfigurationService } from '../../src/configuration/cv-configuration.service';
import { Language } from '../../src/entities/language.entity';

@Injectable()
export class LanguageTestSeed extends NamedSeed {
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly cvConfigurationService: CvConfigurationService,
    @InjectRepository(Language) private languageRepository: Repository<Language>
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
    const candidateResponse = await this.languageRepository.delete({ keycloakId: this.candidateId });
    const adminResponse = await this.languageRepository.delete({ keycloakId: this.adminId });

    if (candidateResponse.affected) {
      this.logger.debug(`removed eduction for user: ${this.candidateId}`);
    }
    if (adminResponse.affected) {
      this.logger.debug(`removed eduction for admin: ${this.adminId}`);
    }
  }
}
