import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'empleo-nestjs-authentication';

@Injectable()
export class PermissionsService {
  /** Check if the given user is the owner of the given resource */
  isOwner({ user, resource }: CheckUserOptions): boolean {
    return user.id === resource.keycloakId;
  }

  /** Check if the user is owner of the given resource or throws a not found exception */
  isOwnerOrNotFound(options: CheckUserOptions, error: NotFoundException = new NotFoundException()) {
    return this.isOwnerOrError(options, error);
  }

  private isOwnerOrError(options: CheckUserOptions, error: HttpException): true | never {
    if (this.isOwner(options)) {
      return true;
    }

    throw error;
  }
}

export interface CheckUserOptions<Resource extends { keycloakId: string } = { keycloakId: string }> {
  user: User;
  resource: Resource;
}
