import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NamedSeed } from 'empleo-nestjs-common';
import { getEnv } from 'empleo-nestjs-testing';
import { In, Repository } from 'typeorm';
import { CvConfigurationService } from '../../src/configuration/cv-configuration.service';
import { Education } from '../../src/entities/education.entity';

@Injectable()
export class EducationTestSeed extends NamedSeed {
  private logger = new Logger(this.constructor.name);
  private testKeycloakIds = new Set();

  constructor(
    private readonly cvConfigurationService: CvConfigurationService,
    @InjectRepository(Education) private educationRepository: Repository<Education>
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
    // create a set with all keycloakId
    this.testKeycloakIds.add([this.candidateId, this.adminId]);

    return this.cvConfigurationService.isTest;
  }

  async down(): Promise<void> {
    const { affected } = await this.educationRepository.delete({ keycloakId: In([...this.testKeycloakIds]) });
    this.testKeycloakIds.clear();

    if (affected) {
      this.logger.debug(`removed eduction for user: ${this.candidateId}`);
    }
  }
}
