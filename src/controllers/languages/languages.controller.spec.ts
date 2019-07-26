import { expect } from 'chai';
import { PermissionsService, userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyOfClass, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { languageCreateBuilder } from '../../builders/languages/language-create.builder';
import { languageBuilder } from '../../builders/languages/language.builder';
import { LanguageNotFoundException } from '../../errors/language-not-found.exception';
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

  const languageUpdate = languageCreateBuilder()
    .withValidData()
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

  describe('#updateOne()', () => {
    it('should update a language when it exists and belong to the user', async () => {
      const languageId = createdLanguage.languageId;

      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenReturn(true);
      when(mockedLanguagesService.updateOne(anything())).thenResolve();
      when(mockedLanguagesService.findUserLanguageById(anything())).thenResolve(createdLanguage);

      const responseLanguage = await languagesController.updateLanguage(user, languageUpdate, {
        languageId,
        keycloakId: user.id
      });

      expect(responseLanguage).to.be.undefined;
      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: user.id } }))).once();
      verify(mockedLanguagesService.findUserLanguageById(deepEqual({ languageId, user }))).calledBefore(
        mockedLanguagesService.updateOne(
          deepEqual({
            language: createdLanguage,
            update: languageUpdate
          })
        )
      );
    });

    it('should throw an language not found exception when the language does not exist', async () => {
      const languageId = createdLanguage.languageId;
      const keycloakId = user.id;

      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenReturn(true);
      when(mockedLanguagesService.updateOne(anything())).thenResolve();
      when(mockedLanguagesService.findUserLanguageById(anything())).thenReject(new LanguageNotFoundException());

      await expect(
        languagesController.updateLanguage(user, languageUpdate, {
          languageId,
          keycloakId
        })
      ).to.eventually.be.rejectedWith(LanguageNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedLanguagesService.findUserLanguageById(deepEqual({ languageId, user }))).once();
      verify(mockedLanguagesService.updateOne(anything())).never();
    });

    it('should throw an language not found error when trying to access an cv from another user', async () => {
      const languageId = createdLanguage.languageId;
      const keycloakId = user.id;

      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new LanguageNotFoundException());
      when(mockedLanguagesService.updateOne(anything())).thenResolve();
      when(mockedLanguagesService.findUserLanguageById(anything())).thenResolve(createdLanguage);

      await expect(
        languagesController.updateLanguage(user, languageUpdate, {
          languageId,
          keycloakId
        })
      ).to.eventually.be.rejectedWith(LanguageNotFoundException);
      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedLanguagesService.findUserLanguageById(deepEqual({ languageId, user }))).never();
      verify(mockedLanguagesService.updateOne(anything())).never();
    });
  });

  describe('#deleteOne()', () => {
    const languageId = createdLanguage.languageId;
    const keycloakId = user.id;

    it('should correctly delete a language', async () => {
      when(mockedLanguagesService.deleteOne(anything())).thenResolve();

      const response = await languagesController.deleteOneLanguage(user, { languageId, keycloakId });

      verify(mockedLanguagesService.deleteOne(deepEqual({ user, languageId }))).once();
      expect(response).to.be.undefined;
    });

    it('should throw an language not found exception when the language does not exist', async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new LanguageNotFoundException());
      when(mockedLanguagesService.deleteOne(anything())).thenReject();

      await expect(
        languagesController.deleteOneLanguage(user, { languageId: faker.random.uuid(), keycloakId: user.id })
      ).to.eventually.be.rejectedWith(LanguageNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId } }))).once();
      verify(mockedLanguagesService.deleteOne(anything())).never();
    });

    it("should throw a language not found exception if user don't have permission", async () => {
      when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new LanguageNotFoundException());
      when(mockedLanguagesService.deleteOne(anything())).thenReject();

      const anotherKeycloakId = faker.random.uuid();

      await expect(
        languagesController.deleteOneLanguage(user, { languageId: createdLanguage.languageId, keycloakId: anotherKeycloakId })
      ).to.be.rejectedWith(LanguageNotFoundException);

      verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: anotherKeycloakId } }))).once();
      verify(mockedLanguagesService.deleteOne({ user, languageId: createdLanguage.languageId })).never();
    });
  });
});
