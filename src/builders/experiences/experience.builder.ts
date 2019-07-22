import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Documentation } from '../../domain/documentation';
import { Experience } from '../../entities/experience.entity';
import { documentationBuilder } from '../common/documentation.builder';

export class ExperienceBuilder extends Builder<Experience> {
  withExperienceId(experienceId = this.faker.random.uuid()): this {
    return this.with('experienceId', experienceId);
  }

  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

  withDateStart(dateStart = this.faker.date.past()): this {
    return this.with('startDate', dateStart);
  }

  withDateEnd(dateEnd = this.faker.date.future()): this {
    return this.with('endDate', dateEnd);
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

  withoutExperienceId() {
    return this.without('experienceId');
  }

  withValidData(): this {
    const documentation = documentationBuilder()
      .withValidData()
      .build();

    return this.withExperienceId()
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
