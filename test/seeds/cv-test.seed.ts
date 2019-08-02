import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NamedSeed } from 'empleo-nestjs-common';
import { getEnv } from 'empleo-nestjs-testing';
import { Repository } from 'typeorm';
import { CvConfigurationService } from '../../src/configuration/cv-configuration.service';
import { Cv } from '../../src/entities/cv.entity';

@Injectable()
export class CvTestSeed extends NamedSeed {
  private logger = new Logger(this.constructor.name);

  constructor(private readonly cvConfigurationService: CvConfigurationService, @InjectRepository(Cv) private cvRepository: Repository<Cv>) {
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
    const [candidateResponse, adminResponse] = await Promise.all([
      this.cvRepository.delete({ keycloakId: this.candidateId }),
      this.cvRepository.delete({ keycloakId: this.adminId })
    ]);

    if (candidateResponse.affected) {
      this.logger.debug(`removed cv for user: ${this.candidateId}`);
    }
    if (adminResponse.affected) {
      this.logger.debug(`removed cv for admin: ${this.adminId}`);
    }
  }
}
