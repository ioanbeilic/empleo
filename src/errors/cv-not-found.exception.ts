import { NotFoundException } from '@nestjs/common';

export class CvNotFoundException extends NotFoundException {
  constructor() {
    super('Cv not found');
  }
}
