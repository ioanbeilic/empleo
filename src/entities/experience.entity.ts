import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { CreatedAtColumn, UpdatedAtColumn } from 'empleo-nestjs-common';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { DateTransformer } from '../common/date.transformer';
import { AdditionalDocument } from '../domain/additional-document';
import { ExperienceCreate } from '../dto/experience-create.dto';
import { Cv } from './cv.entity';

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

  @Column({ type: 'varchar', name: 'company_name', length: 50 })
  companyName!: string;

  @Column({ type: 'varchar', length: 100 })
  position!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiModelProperty({ type: [AdditionalDocument] })
  document?: AdditionalDocument[];

  @Column({ type: 'date', name: 'date_start', transformer: DateTransformer.nullable() })
  startDate!: Date;

  @Column({ type: 'date', name: 'date_end', nullable: true, default: null, transformer: DateTransformer.nullable() })
  endDate?: Date;

  @IsDate()
  @CreatedAtColumn()
  @Exclude()
  createdAt!: Date;

  @IsDate()
  @UpdatedAtColumn()
  @Exclude()
  updatedAt!: Date;

  @ManyToOne(() => Cv, cv => cv.educations, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'keycloak_id', referencedColumnName: 'keycloakId' })
  cv?: Cv;
}

export type ExperienceId = typeof Experience.prototype.experienceId;
