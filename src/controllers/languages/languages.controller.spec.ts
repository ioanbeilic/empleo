import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyOfClass, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { languageCreateBuilder } from '../../builders/languages/language-create.builder';
import { languageBuilder } from '../../builders/languages/language.builder';
import { LanguageNotFoundException } from '../../errors/language-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { LanguagesService } from '../../services/languages/languages.service';
import { LanguagesController } from './languages.controller';

describe('LanguagesController', () => {
  let mockedLanguagesService: LanguagesService;
  let mockedPermissionsService: PermissionsService;
  let languagesController: LanguagesController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const languageCreate = languageCreateBuilder()
    .withValidData()
    .build();

  const language = languageBuilder()
    .hydrate(languageCreate)
    .withoutLanguageId()
    .build();

  const createdLanguage = languageBuilder()
    .hydrate(language)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedLanguagesService = mock(LanguagesService);
    mockedPermissionsService = mock(PermissionsService);
    languagesController = new LanguagesController(instance(mockedLanguagesService), instance(mockedPermissionsService));
  });

  describe('#createLanguage()', () => {
    it('should create a language', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenReturn(true);
      when(mockedLanguagesService.createLanguage(anything())).thenResolve(createdLanguage);

      const keycloakId = user.id;
      const result = await languagesController.createLanguage(user, { keycloakId }, languageCreate);

      expect(result).to.be.equal(createdLanguage);
      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(LanguageNotFoundException)
        )
      ).once();
      verify(mockedLanguagesService.createLanguage(deepEqual({ user, language: languageCreate }))).once();
    });

    it('should throw a not found error when the user is not the owner of the resource', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything(), anything())).thenThrow(new LanguageNotFoundException());
      when(mockedLanguagesService.createLanguage(anything())).thenResolve(createdLanguage);

      const keycloakId = faker.random.uuid();

      await expect(languagesController.createLanguage(user, { keycloakId }, language)).to.eventually.be.rejectedWith(
        LanguageNotFoundException
      );

      verify(
        mockedPermissionsService.isOwnerOrNotFound(
          deepEqual({
            user,
            resource: { keycloakId }
          }),
          anyOfClass(LanguageNotFoundException)
        )
      ).once();
      verify(mockedLanguagesService.createLanguage(anything())).never();
    });
  });
});
