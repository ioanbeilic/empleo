import { plainToClass } from 'class-transformer';
import { format } from 'date-fns';
import { Builder } from 'empleo-nestjs-testing';
import { AdditionalDocument } from '../../domain/additional-document';
import { ExperienceCreate } from '../../dto/experience-create.dto';
import { additionalDocumentBuilder } from '../common/additional-document.builder';

export class ExperienceCreateBuilder extends Builder<ExperienceCreate> {
  withStartDate(startDate = new Date(format(this.faker.date.past(), 'YYYY-MM-DD'))): this {
    return this.with('startDate', startDate);
  }

  withEndDate(endDate = new Date(format(this.faker.date.future(), 'YYYY-MM-DD'))): this {
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

  withAdditionalDocument(...document: AdditionalDocument[]): this {
    return this.with('documents', document);
  }

  withoutAdditionalDocument(): this {
    return this.without('documents');
  }

  withoutEndDate() {
    return this.without('endDate');
  }

  withValidData(): this {
    const document = additionalDocumentBuilder()
      .withValidData()
      .build();

    return this.withStartDate()
      .withEndDate()
      .withCompanyName()
      .withTitle()
      .withPosition()
      .withDescription()
      .withTitle()
      .withAdditionalDocument(document);
  }

  build(): ExperienceCreate {
    return plainToClass(ExperienceCreate, this.data);
  }
}

export function experienceCreateBuilder() {
  return new ExperienceCreateBuilder();
}
