import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { educationCreateBuilder } from '../../builders/educations/education-create.builder';
import { educationBuilder } from '../../builders/educations/education.builder';
import { EducationsController } from '../../controllers/educations/educations.controller';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';
import { EducationsService } from '../educations/educations.service';
import { CheckUserService } from './check-user.service';

describe('CheckUserService', () => {
  let mockedCheckUserService: CheckUserService;
  let mockedEducationsService: EducationsService;
  let educationsController: EducationsController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const user2 = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  const education = educationCreateBuilder()
    .withValidData()
    .build();

  const createdEducation = educationBuilder()
    .hydrate(education)
    .withKeycloakId(user.id)
    .build();

  beforeEach(() => {
    mockedEducationsService = mock(EducationsService);
    mockedCheckUserService = mock(CheckUserService);
    educationsController = new EducationsController(instance(mockedEducationsService), instance(mockedCheckUserService));
  });

  it('should pass when the profile id is the same as param keycloakId', async () => {
    when(mockedCheckUserService.checkParam(anything())).thenResolve();
    when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

    const responseEducation = await educationsController.createEducation(user, { keycloakId: user.id }, education);
    verify(mockedCheckUserService.checkParam(objectContaining({ user, param: user.id }))).once();
    expect(responseEducation).to.be.equal(createdEducation);
  });

  it('should return a not found exception when the profile is is not the same as param keycloakId', async () => {
    when(mockedEducationsService.createEducation(anything())).thenResolve(createdEducation);

    when(mockedCheckUserService.checkParam(anything())).thenThrow(new EducationNotFoundException());

    await expect(educationsController.createEducation(user, { keycloakId: user2.id }, education)).to.eventually.be.rejectedWith(
      EducationNotFoundException
    );

    verify(mockedCheckUserService.checkParam(objectContaining({ user, param: user2.id }))).once();
    verify(mockedEducationsService.createEducation(objectContaining({ user, education }))).never();
  });
});
