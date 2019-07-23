import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Documentation } from '../../domain/documentation';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { documentationBuilder } from '../common/documentation.builder';

export class ExperienceCreateBuilder extends Builder<ExperienceCreate> {
  withStartDate(startDate = this.faker.date.past()): this {
    return this.with('startDate', startDate);
  }

  withEndDate(endDate = this.faker.date.future()): this {
    return this.with('endDate', endDate);
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

  withoutDocumentation(): this {
    return this.without('documentation');
  }

  withoutEndDate() {
    return this.without('endDate');
  }

  withValidData(): this {
    const documentation = documentationBuilder()
      .withValidData()
      .build();

    return this.withStartDate()
      .withEndDate()
      .withCompanyName()
      .withTitle()
      .withPosition()
      .withDescription()
      .withTitle()
      .withDocumentation(documentation);
  }

  build(): ExperienceCreate {
    return plainToClass(ExperienceCreate, this.data);
  }
}

export function experienceCreateBuilder() {
  return new ExperienceCreateBuilder();
}
