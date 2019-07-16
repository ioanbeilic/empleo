import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { EducationsService } from '../../services/educations/educations.service';
import { EducationsController } from './educations.controller';

describe('EducationsController', () => {
  let mockEducationsService: EducationsService;
  let educationsController: EducationsController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const educationCreate = educationCreateBuilder()
    .withValidData()
    .build();

  const education = educationBuilder()
    .withValidData()
    .build();

  const createdEducation = educationBuilder()
    .hydrate(education)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockEducationsService = mock(EducationsService);
    educationsController = new EducationsController(instance(mockEducationsService));
  });

  describe('#createEducation()', () => {
    it('should create a education', async () => {
      when(mockEducationsService.createEducation(anything())).thenResolve(createdEducation);

      const responseEducation = await educationsController.createEducation(user, educationCreate);

      verify(mockEducationsService.createEducation(objectContaining({ user, education: educationCreate }))).once();
      expect(responseEducation).to.be.equal(createdEducation);
    });
  });
});
