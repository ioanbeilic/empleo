import { plainToClass } from 'class-transformer';
import { format } from 'date-fns';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocument } from '../../domain/additional-document';
import { EducationCreate } from '../../dto/education-create.dto';
import { additionalDocumentBuilder } from '../common/additional-document.builder';

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

  withStartDate(startDate = new Date(format(this.faker.date.past(), 'YYYY-MM-DD'))): this {
    return this.with('startDate', startDate);
  }

  withEndDate(endDate = new Date(format(this.faker.date.future(), 'YYYY-MM-DD'))): this {
    return this.with('endDate', endDate);
  }

  withAdditionalDocument(...document: AdditionalDocument[]): this {
    return this.with('document', document);
  }

  withoutAdditionalDocument(): this {
    return this.without('document');
  }

  withoutEndDate() {
    return this.without('endDate');
  }

  withValidData(): this {
    const document = additionalDocumentBuilder()
      .withValidData()
      .build();

    return this.withCenterType()
      .withCountry()
      .withCenterName()
      .withTitle()
      .withCategory()
      .withAdditionalDocument(document)
      .withStartDate()
      .withEndDate();
  }

  build(): EducationCreate {
    return plainToClass(EducationCreate, this.data);
  }
}

export function educationCreateBuilder() {
  return new EducationCreateBuilder();
}
