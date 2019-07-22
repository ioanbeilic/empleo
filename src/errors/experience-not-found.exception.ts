import { NotFoundException } from '@nestjs/common';

export class ExperienceNotFoundException extends NotFoundException {
  constructor() {
    super('Experience not found');
  }
}
