import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';

@Entity()
export class Cv {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  cvId!: string;

  @IsUUID()
  @Exclude()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @Column({ type: 'uuid', name: 'keycloak_id', unique: true })
  keycloakId!: string;
}

export type CvId = typeof Cv.prototype.cvId;
