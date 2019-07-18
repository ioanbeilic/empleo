import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anyString, anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { DeleteResult, Repository } from 'typeorm';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { Education } from '../../entities/education.entity';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { EducationsService } from './educations.service';

describe('EducationService', () => {
  let mockedEducationRepository: Repository<Education>;
  let educationService: EducationsService;

  let educationRepository: Repository<Education>;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const educationCreate = educationCreateBuilder()
    .withValidData()
    .build();

  const education = educationBuilder()
    .hydrate(educationCreate)
    .withoutEducationId()
    .withValidData()
    .build();

  const createdEducation = educationBuilder()
    .hydrate(education)
    .withEducationId()
    .withKeycloakId(user.id)
    .build();

  const educationUpdate = educationCreateBuilder()
    .withValidData()
    .build();

  beforeEach(() => {
    mockedEducationRepository = (mock(Repository) as unknown) as Repository<Education>;
    educationRepository = instance(mockedEducationRepository);
    educationService = new EducationsService(educationRepository);
  });

  describe('#create()', () => {
    it('should correctly create a education', async () => {
      when(mockedEducationRepository.create(anything() as Partial<Education>)).thenReturn(education);
      when(mockedEducationRepository.save(anything())).thenResolve(createdEducation);

      const result = await educationService.createEducation({ user, education: educationCreate });

      expect(result).to.be.equal(createdEducation);

      verify(
        mockedEducationRepository.create(
          deepEqual({
            ...educationCreate,
            educationId: anyString(),
            keycloakId: user.id
          })
        )
      ).once();
      verify(mockedEducationRepository.save(education)).once();
    });
  });

  describe('#findUserEducationById()', () => {
    it('should return the education when it exists and belong to the user', async () => {
      when(mockedEducationRepository.findOne(anything())).thenResolve(createdEducation);

      const educationId = createdEducation.educationId;
      const foundEducation = await educationService.findUserEducationById({ educationId, user });

      verify(mockedEducationRepository.findOne(objectContaining({ educationId }))).once();
      expect(foundEducation).to.be.equal(createdEducation);
    });

    it('should throw an education not found exception when the education does not exists', async () => {
      const educationId = createdEducation.educationId;

      when(mockedEducationRepository.findOne(anything())).thenResolve(undefined);

      await expect(educationService.findUserEducationById({ educationId, user })).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedEducationRepository.findOne(objectContaining({ educationId }))).once();
    });
  });

  describe('#updateOne()', () => {
    it('should update the education when it exists and belong to the user', async () => {
      when(mockedEducationRepository.update(anything(), anything() as Partial<Education>)).thenResolve();

      await educationService.updateOne({ education, update: educationUpdate });

      verify(
        mockedEducationRepository.update(objectContaining({ educationId: education.educationId }), objectContaining(educationUpdate))
      ).once();
    });

    it('should throw an education not found exception when the education does not exists', async () => {
      const educationId = 'inexistent id';

      when(mockedEducationRepository.findOne(anything())).thenResolve(undefined);

      await expect(educationService.findUserEducationById({ educationId, user })).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedEducationRepository.findOne(objectContaining({ educationId }))).once();
    });

    it('should throw an education not found exception when the education exists but it does not belong to the user', async () => {
      const educationId = createdEducation.educationId;
      user.id = 'fake id';

      when(mockedEducationRepository.findOne(anything())).thenResolve(undefined);

      await expect(educationService.findUserEducationById({ educationId, user })).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedEducationRepository.findOne(objectContaining({ educationId }))).once();
    });
  });

  describe('#deleteOne()', () => {
    it('should correctly delete a education stage', async () => {
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: []
      };

      when(mockedEducationRepository.delete(anything())).thenReturn(Promise.resolve(deleteResult));

      const educationId = createdEducation.educationId;

      const result = await educationService.deleteOne({ user, educationId });

      verify(mockedEducationRepository.delete(objectContaining({ educationId, keycloakId: user.id }))).once();

      expect(result).to.be.undefined;
    });

    it('should throw an education not found exception when the education does not exists', async () => {
      const educationId = createdEducation.educationId;
      const deleteResult: DeleteResult = {
        affected: 0,
        raw: []
      };

      when(mockedEducationRepository.delete(anything())).thenReturn(Promise.resolve(deleteResult));

      await expect(educationService.deleteOne({ educationId, user })).eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedEducationRepository.delete(objectContaining({ educationId, keycloakId: user.id }))).once();
    });

    it('should throw an education not found exception when the education exists but it does not belong to the user', async () => {
      const educationId = createdEducation.educationId;
      const deleteResult: DeleteResult = {
        affected: 0,
        raw: []
      };
      user.id = faker.random.uuid();

      when(mockedEducationRepository.delete(anything())).thenReturn(Promise.resolve(deleteResult));

      await expect(educationService.deleteOne({ educationId, user })).to.eventually.be.rejectedWith(EducationNotFoundException);

      verify(mockedEducationRepository.delete(objectContaining({ educationId }))).once();
    });
  });
});
