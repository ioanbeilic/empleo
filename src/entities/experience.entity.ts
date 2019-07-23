import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { CreatedAtColumn, UpdatedAtColumn } from 'empleo-nestjs-common';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { Documentation } from '../domain/documentation';
import { ExperienceCreate } from '../dto/experience-create.dto';

@Entity()
export class Experience extends ExperienceCreate {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  experienceId!: string;

  @IsUUID()
  @Column({ type: 'uuid', name: 'keycloak_id' })
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  keycloakId!: string;

  @Column({ type: 'date', name: 'date_start' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true, default: null, name: 'date_end' })
  endDate?: Date;

  @Column({ type: 'varchar', name: 'company_name', length: 50 })
  companyName!: string;

  @Column({ type: 'varchar', length: 100 })
  position!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiModelProperty({ type: [Documentation] })
  documentation?: Documentation[];

  @IsDate()
  @CreatedAtColumn()
  @Exclude()
  createdAt!: Date;

  @IsDate()
  @UpdatedAtColumn()
  @Exclude()
  updatedAt!: Date;
}

export type ExperienceId = typeof Experience.prototype.experienceId;
