import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocumentation } from '../../domain/additional-documentation';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { additionalDocumentationBuilder } from '../common/additional-documentation.builder';

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

  withAdditionalDocumentation(...documentation: AdditionalDocumentation[]): this {
    return this.with('documentation', documentation);
  }

  withoutAdditionalDocumentation(): this {
    return this.without('documentation');
  }

  withoutEndDate() {
    return this.without('endDate');
  }

  withValidData(): this {
    const documentation = additionalDocumentationBuilder()
      .withValidData()
      .build();

    return this.withStartDate()
      .withEndDate()
      .withCompanyName()
      .withTitle()
      .withPosition()
      .withDescription()
      .withTitle()
      .withAdditionalDocumentation(documentation);
  }

  build(): ExperienceCreate {
    return plainToClass(ExperienceCreate, this.data);
  }
}

export function experienceCreateBuilder() {
  return new ExperienceCreateBuilder();
}
