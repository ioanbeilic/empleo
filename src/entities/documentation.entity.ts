import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { CreatedAtColumn, UpdatedAtColumn } from 'empleo-nestjs-common';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { DocumentationCreate } from '../dto/documentation-create.dto';
import { Cv } from './cv.entity';

@Entity()
export class Documentation extends DocumentationCreate {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  documentationId!: string;

  @IsUUID()
  @Exclude()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @Column({ type: 'uuid', name: 'keycloak_id' })
  keycloakId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url!: string | null;

  @IsDate()
  @CreatedAtColumn()
  @Exclude()
  createdAt!: Date;

  @IsDate()
  @UpdatedAtColumn()
  @Exclude()
  updatedAt!: Date;

  @ManyToOne(() => Cv, cv => cv.documentations, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'keycloak_id', referencedColumnName: 'keycloakId' })
  cv?: Cv;
}

export type DocumentationId = typeof Documentation.prototype.documentationId;
