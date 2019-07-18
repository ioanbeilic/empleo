import { NotFoundException } from '@nestjs/common';

export class EducationNotFoundException extends NotFoundException {
  constructor() {
    super('Education not found');
  }
}
