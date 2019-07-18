import { Injectable } from '@nestjs/common';
import { User } from 'empleo-nestjs-authentication';
import { EducationNotFoundException } from '../../errors/education-not-found.exception';

@Injectable()
export class CheckUserService {
  checkParam({ user, param }: CheckUserOptions) {
    if (user.id !== param) {
      throw new EducationNotFoundException();
    }
  }
}

export interface CheckUserOptions {
  user: User;
  param: string;
}
