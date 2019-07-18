import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Documentation } from '../..//domain/documentation';
import { Experience } from '../../entities/experience.entity';
import { documentationBuilder } from '../common/documentation.builder';

export class ExperienceBuilder extends Builder<Experience> {
  withEducationId(experienceId = this.faker.random.uuid()): this {
    return this.with('experienceId', experienceId);
  }

  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

  withDateStart(dateStart = this.faker.date.future()): this {
    return this.with('dateStart', dateStart);
  }

  withDateEnd(dateEnd = this.faker.date.future()): this {
    return this.with('dateEnd', dateEnd);
  }

  withCompanyName(companyName = this.faker.company.companyName()): this {
    return this.with('companyName', companyName);
  }

  withPosition(position = this.faker.lorem.word()): this {
    return this.with('position', position);
  }

  withDescription(description = this.faker.lorem.paragraph()): this {
    return this.with('description', description);
  }

  withTitle(title = this.faker.random.word()): this {
    return this.with('title', title);
  }

  withDocumentation(...documentation: Documentation[]): this {
    return this.with('documentation', documentation);
  }

  withValidData(): this {
    const documentation = documentationBuilder()
      .withValidData()
      .build();

    return this.withEducationId()
      .withKeycloakId()
      .withDateStart()
      .withDateEnd()
      .withCompanyName()
      .withTitle()
      .withPosition()
      .withDescription()
      .withTitle()
      .withDocumentation(documentation);
  }

  build(): Experience {
    return plainToClass(Experience, this.data);
  }
}

export function experienceBuilder() {
  return new ExperienceBuilder();
}
