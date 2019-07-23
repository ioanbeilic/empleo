import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { CreatedAtColumn, EntityColumnTransformer, UpdatedAtColumn } from 'empleo-nestjs-common';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { Documentation } from '../domain/documentation';
import { EducationCreate } from '../dto/education-create.dto';
import { Cv } from './cv.entity';

@Entity()
export class Education extends EducationCreate {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  educationId!: string;

  @IsUUID()
  @Exclude()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @ManyToOne(type => Cv, cv => cv, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'keycloak_id', referencedColumnName: 'keycloakId' })
  @Column({ type: 'uuid', name: 'keycloak_id' })
  keycloakId!: string;

  @Column({ type: 'varchar', name: 'center_type', length: 40 })
  centerType!: string;

  @Column({ type: 'varchar', length: 40 })
  country!: string;

  @Column({ type: 'varchar', name: 'center_name', length: 40 })
  centerName!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  category!: string;

  @Column({ type: 'date', name: 'date_start' })
  startDate!: Date;

  @Column({ type: 'date', name: 'date_end', nullable: true })
  endDate?: Date;

  @Column({ type: 'jsonb', transformer: new EntityColumnTransformer(Documentation) })
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

export type EducationId = typeof Education.prototype.educationId;
