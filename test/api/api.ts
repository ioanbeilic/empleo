import { NestApplication } from '@nestjs/core';
import { AppWrapper } from 'empleo-nestjs-testing';
import { CvApi } from './cv.api';
import { DocumentationsApi } from './documentations.api';
import { EducationsApi } from './educations.api';
import { ExperiencesApi } from './experiences.api';
import { LanguagesApi } from './languages.api';

export function api(app: AppWrapper | NestApplication, { token }: { token?: string } = {}) {
  return {
    cv({ keycloakId }: ApiPath) {
      return new CvApi({ app: app instanceof AppWrapper ? app.app : app, token, path: `/${keycloakId}/cv` });
    },
    educations({ keycloakId }: ApiPath) {
      return new EducationsApi({ app: app instanceof AppWrapper ? app.app : app, token, path: `/${keycloakId}/educations` });
    },
    documentations({ keycloakId }: ApiPath) {
      return new DocumentationsApi({ app: app instanceof AppWrapper ? app.app : app, token, path: `/${keycloakId}/documentations` });
    },
    languages({ keycloakId }: ApiPath) {
      return new LanguagesApi({ app: app instanceof AppWrapper ? app.app : app, token, path: `/${keycloakId}/languages` });
    },
    experiences({ keycloakId }: ApiPath) {
      return new ExperiencesApi({ app: app instanceof AppWrapper ? app.app : app, token, path: `/${keycloakId}/experiences` });
    }
  };
}

interface ApiPath {
  keycloakId: string;
}
