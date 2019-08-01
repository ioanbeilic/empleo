import { plainToClass } from 'class-transformer';
import { format } from 'date-fns';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocument } from '../../domain/additional-document';
import { Education } from '../../entities/education.entity';
import { additionalDocumentBuilder } from '../common/additional-document.builder';

export class EducationBuilder extends Builder<Education> {
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

  withAdditionalDocument(...documents: AdditionalDocument[]): this {
    return this.with('documents', documents);
  }

  withStartDate(startDate = new Date(format(this.faker.date.past(), 'YYYY-MM-DD'))): this {
    return this.with('startDate', startDate);
  }

  withEndDate(endDate = new Date(format(this.faker.date.future(), 'YYYY-MM-DD'))): this {
    return this.with('endDate', endDate);
  }

  withoutEducationId() {
    return this.without('educationId');
  }

  withoutEndDate() {
    return this.without('endDate');
  }

  withValidData(): this {
    const document = additionalDocumentBuilder()
      .withValidData()
      .build();

    return this.withKeycloakId()
      .withCenterType()
      .withCountry()
      .withCenterName()
      .withTitle()
      .withCategory()
      .withStartDate()
      .withEndDate()
      .withAdditionalDocument(document);
  }

  build(): Education {
    return plainToClass(Education, this.data);
  }
}

export function educationBuilder() {
  return new EducationBuilder();
}
