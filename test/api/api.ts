import { AppWrapper } from 'empleo-nestjs-testing';
import { CvApi } from './cv.api';
import { DocumentsApi } from './documents.api';
import { EducationsApi } from './educations.api';
import { ExperiencesApi } from './experiences.api';
import { LanguagesApi } from './languages.api';

export function api({ app }: AppWrapper, { token }: { token?: string } = {}) {
  return {
    cv({ keycloakId }: ApiPath) {
      return new CvApi({ app, token, path: `/${keycloakId}` });
    },
    educations({ keycloakId }: ApiPath) {
      return new EducationsApi({ app, token, path: `/${keycloakId}/educations` });
    },
    documents({ keycloakId }: ApiPath) {
      return new DocumentsApi({ app, token, path: `/${keycloakId}/documents` });
    },
    languages({ keycloakId }: ApiPath) {
      return new LanguagesApi({ app, token, path: `/${keycloakId}/languages` });
    },
    experiences({ keycloakId }: ApiPath) {
      return new ExperiencesApi({ app, token, path: `/${keycloakId}/experiences` });
    }
  };
}

interface ApiPath {
  keycloakId: string;
}
