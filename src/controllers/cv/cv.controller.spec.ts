import { expect } from 'chai';
import { PermissionsService, userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Cv } from '../../entities/cv.entity';
import { CvNotFoundException } from '../../errors/cv-not-found.exception';
import { CvService } from '../../services/cv/cv.service';
import { CvController } from './cv.controller';

describe('CvController', () => {
  let mockedCvService: CvService;
  let mockedPermissionsService: PermissionsService;
  let cvController: CvController;

  const user = userBuilder()
    .withValidData()
    .asAdmin()
    .build();

  beforeEach(() => {
    mockedCvService = mock(CvService);
    mockedPermissionsService = mock(PermissionsService);
    cvController = new CvController(instance(mockedCvService), instance(mockedPermissionsService));
  });

  describe('#deleteOneCv()', () => {
    it('should correctly delete a cv', async () => {
      const keycloakId = user.id;
      when(mockedCvService.deleteOne(anything())).thenResolve();

      const response = await cvController.deleteOneCv(user, { keycloakId });

      verify(mockedCvService.deleteOne(keycloakId)).once();
      expect(response).to.be.undefined;
    });
  });

  it('should throw a cv not found exception when trying to delete a CV from another user', async () => {
    when(mockedPermissionsService.isOwnerOrNotFound(anything())).thenThrow(new CvNotFoundException());
    when(mockedCvService.deleteOne(anything())).thenReject();

    const anotherKeycloakId = faker.random.uuid();

    await expect(cvController.deleteOneCv(user, { keycloakId: anotherKeycloakId })).to.be.rejectedWith(CvNotFoundException);

    verify(mockedPermissionsService.isOwnerOrNotFound(deepEqual({ user, resource: { keycloakId: anotherKeycloakId } }))).once();
    verify(mockedCvService.deleteOne(user.id)).never();
  });

  describe('#findByUser()', () => {
    const cv: Cv = {
      cvId: faker.random.uuid(),
      keycloakId: user.id,
      educations: [],
      experiences: [],
      languages: [],
      documents: []
    };

    it('should find the cv', async () => {
      when(mockedCvService.findByUser(anything())).thenResolve(cv);

      const response = await cvController.findCvByUser(user, { keycloakId: user.id });

      verify(mockedCvService.findByUser(user)).once();
      expect(response).to.be.equal(cv);
    });
  });
});
