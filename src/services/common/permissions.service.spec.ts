import { NotFoundException } from '@nestjs/common';
import { expect } from 'chai';
import { userBuilder } from 'empleo-nestjs-authentication';
import faker from 'faker';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  const user = userBuilder()
    .withValidData()
    .build();

  const permissionsService = new PermissionsService();

  describe('#isOwner()', () => {
    it('should return true when the user is the owner of the resource', () => {
      const resource = getResource(user.id);

      expect(permissionsService.isOwner({ user, resource })).to.be.true;
    });

    it('should return false when the user is not the owner of the resource', () => {
      const resource = getResource();

      expect(permissionsService.isOwner({ user, resource })).to.be.false;
    });
  });

  describe('#isOwnerOrNotFound()', () => {
    it('should return true when the user is the owner of the resource', () => {
      const resource = getResource(user.id);

      expect(permissionsService.isOwnerOrNotFound({ user, resource })).to.be.true;
    });

    it('should throw a not found error when the user is not the owner of the resource', () => {
      const resource = getResource();

      expect(() => {
        permissionsService.isOwnerOrNotFound({ user, resource });
      }).to.throw(NotFoundException);
    });
  });
});

function getResource(keycloakId = faker.random.uuid()) {
  return { keycloakId };
}
