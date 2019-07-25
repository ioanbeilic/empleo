import { NotFoundException } from '@nestjs/common';

export class LanguageNotFoundException extends NotFoundException {
  constructor() {
    super('Language not found');
  }
}
