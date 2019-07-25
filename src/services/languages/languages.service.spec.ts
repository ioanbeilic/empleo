import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { languageCreateBuilder } from '../../builders/languages/language-create.builder';
import { languageBuilder } from '../../builders/languages/language.builder';
import { LanguageCreate } from '../../dto/language-create.dto';
import { Language } from '../../entities/language.entity';
import { CvService } from '../cv/cv.service';
import { LanguagesService } from './languages.service';

describe('LanguagesService', () => {
  let mockedLanguageRepository: Repository<Language>;
  let languagesService: LanguagesService;
  let mockedCvService: CvService;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const languageCreate: LanguageCreate = languageCreateBuilder()
    .withValidData()
    .build();

  const language: Language = languageBuilder()
    .withValidData()
    .build();

  const languageUpdate = languageCreateBuilder()
    .withValidData()
    .build();

  const createdLanguage = languageBuilder()
    .hydrate(language)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedLanguageRepository = (mock(Repository) as unknown) as Repository<Language>;
    mockedCvService = mock(CvService);
    languagesService = new LanguagesService(instance(mockedLanguageRepository), instance(mockedCvService));
  });

  describe('#create()', () => {
    it('should correctly create a language', async () => {
      when(mockedLanguageRepository.create(anything() as Partial<Language>)).thenReturn(language);

      when(mockedLanguageRepository.save(language)).thenResolve(createdLanguage);

      await languagesService.createLanguage({ user, language: languageCreate });

      verify(mockedLanguageRepository.create(objectContaining({ ...languageCreate, keycloakId: user.id }))).once();
      verify(mockedLanguageRepository.save(language)).once();
    });
  });

  describe('#updateOne()', () => {
    it('should update the language when it exists and belong to the user', async () => {
      when(mockedLanguageRepository.update(anything(), anything() as Partial<Language>)).thenResolve();

      await languagesService.updateOne({ language, update: languageUpdate });

      verify(mockedLanguageRepository.update(deepEqual({ languageId: language.languageId }), deepEqual(languageUpdate))).once();
    });
  });
});
