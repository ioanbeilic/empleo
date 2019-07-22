import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Documentation } from '../../domain/documentation';
import { EducationCreate } from '../../dto/education-create.dto';
import { Education } from '../../entities/education.entity';
import { documentationBuilder } from './documentation.builder';

export class EducationCreateBuilder extends Builder<EducationCreate> {
  withCenterType(centerType = this.faker.random.word()): this {
    return this.with('centerType', centerType);
  }

  withCountry(country = this.faker.address.countryCode()): this {
    return this.with('country', country);
  }

  withCenterName(centerName = this.faker.company.companyName()): this {
    return this.with('centerName', centerName);
  }

  withTitle(title = this.faker.random.word()): this {
    return this.with('title', title);
  }

  withCategory(category = this.faker.commerce.department()): this {
    return this.with('category', category);
  }

  withStartDate(startDate = this.faker.date.past()): this {
    return this.with('startDate', startDate);
  }

  withEndDate(endDate = this.faker.date.future()): this {
    return this.with('endDate', endDate);
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

    return this.withCenterType()
      .withCountry()
      .withCenterName()
      .withTitle()
      .withCategory()
      .withDocumentation(documentation)
      .withStartDate()
      .withEndDate();
  }

  build(): Education {
    return plainToClass(Education, this.data);
  }
}

export function educationCreateBuilder() {
  return new EducationCreateBuilder();
}
