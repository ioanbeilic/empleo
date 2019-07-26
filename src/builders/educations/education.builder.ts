import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocumentation } from '../../domain/additional-documentation';
import { Education } from '../../entities/education.entity';
import { additionalDocumentationBuilder } from '../common/additional-documentation.builder';

export class EducationBuilder extends Builder<Education> {
  withEducationId(educationId = this.faker.random.uuid()): this {
    return this.with('educationId', educationId);
  }

  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

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

  withAdditionalDocumentation(...documentation: AdditionalDocumentation[]): this {
    return this.with('documentation', documentation);
  }

  withStartDate(startDate = this.faker.date.past()): this {
    return this.with('startDate', startDate);
  }

  withEndDate(endDate = this.faker.date.future()): this {
    return this.with('endDate', endDate);
  }

  withoutEducationId() {
    return this.without('educationId');
  }

  withoutEndDate() {
    return this.without('endDate');
  }

  withValidData(): this {
    const documentation = additionalDocumentationBuilder()
      .withValidData()
      .build();

    return this.withEducationId()
      .withKeycloakId()
      .withCenterType()
      .withCountry()
      .withCenterName()
      .withTitle()
      .withCategory()
      .withStartDate()
      .withEndDate()
      .withAdditionalDocumentation(documentation);
  }

  build(): Education {
    return plainToClass(Education, this.data);
  }
}

export function educationBuilder() {
  return new EducationBuilder();
}
