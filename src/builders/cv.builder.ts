import { plainToClass } from 'class-transformer';
import { Builder } from 'empleo-nestjs-testing';
import { Cv } from '../entities/cv.entity';
import { Document } from '../entities/document.entity';
import { Education } from '../entities/education.entity';
import { Experience } from '../entities/experience.entity';

export class CvBuilder extends Builder<Cv> {
  withCvId(cvId = this.faker.random.uuid()): this {
    return this.with('cvId', cvId);
  }

  withKeycloakId(keycloakId = this.faker.random.uuid()): this {
    return this.with('keycloakId', keycloakId);
  }

  withEducations(...educations: Education[]): this {
    return this.with('educations', educations);
  }

  withExperiences(...experiences: Experience[]): this {
    return this.with('experiences', experiences);
  }

  withLanguages(...languages: Experience[]): this {
    return this.with('experiences', languages);
  }

  withDocuments(...documents: Document[]): this {
    return this.with('documents', documents);
  }

  withoutCvId(): this {
    return this.without('cvId');
  }

  withValidData(): this {
    return this.withCvId()
      .withKeycloakId()
      .withEducations()
      .withExperiences()
      .withLanguages()
      .withDocuments();
  }

  build(): Cv {
    return plainToClass(Cv, this.data);
  }
}

export function cvBuilder() {
  return new CvBuilder();
}
