import { NotFoundException } from '@nestjs/common';

export class DocumentationNotFoundException extends NotFoundException {
  constructor() {
    super('Documentation not found');
  }
}
