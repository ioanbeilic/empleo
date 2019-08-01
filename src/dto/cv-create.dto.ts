import { ApiModelProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import uuid from 'uuid/v4';

export class CvCreate {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  keycloakId!: string;
}
