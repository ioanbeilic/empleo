import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { DeleteResult, Repository } from 'typeorm';
import { languageCreateBuilder } from '../../builders/languages/language-create.builder';
import { languageBuilder } from '../../builders/languages/language.builder';
import { Language } from '../../entities/language.entity';
import { LanguageNotFoundException } from '../../errors/language-not-found.exception';
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

  const languageCreate = languageCreateBuilder()
    .withValidData()
    .build();

  const language = languageBuilder()
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

      verify(mockedLanguageRepository.create(deepEqual({ ...languageCreate, keycloakId: user.id }))).once();
      verify(mockedCvService.ensureExists(user.id)).once();
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

  describe('#deleteOne()', () => {
    it('should correctly delete a language stage', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };

      when(mockedLanguageRepository.delete(anything())).thenResolve(deleteResult);

      const languageId = createdLanguage.languageId;
      const result = await languagesService.deleteOne({ user, languageId });

      verify(mockedLanguageRepository.delete(deepEqual({ languageId, keycloakId: user.id }))).once();

      expect(result).to.be.undefined;
    });

    it('should throw an language not found exception when the language does not exists', async () => {
      const languageId = createdLanguage.languageId;
      const deleteResult: DeleteResult = { affected: 0, raw: [] };

      when(mockedLanguageRepository.delete(anything())).thenResolve(deleteResult);

      await expect(languagesService.deleteOne({ languageId, user })).eventually.be.rejectedWith(LanguageNotFoundException);

      verify(mockedLanguageRepository.delete(deepEqual({ languageId, keycloakId: user.id }))).once();
    });

    it('should throw an language not found exception when the language exists but it does not belong to the user', async () => {
      const languageId = createdLanguage.languageId;
      const deleteResult: DeleteResult = { affected: 0, raw: [] };
      const anotherUser = userBuilder()
        .withValidData()
        .build();

      when(mockedLanguageRepository.delete(anything())).thenResolve(deleteResult);

      await expect(languagesService.deleteOne({ languageId, user: anotherUser })).to.eventually.be.rejectedWith(LanguageNotFoundException);

      verify(mockedLanguageRepository.delete(deepEqual({ languageId, keycloakId: anotherUser.id }))).once();
    });
  });
});
