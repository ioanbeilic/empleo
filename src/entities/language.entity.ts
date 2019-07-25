import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { CreatedAtColumn, UpdatedAtColumn } from 'empleo-nestjs-common';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { LanguageLevel } from '../domain/language-level.enum';
import { LanguageCreate } from '../dto/language-create.dto';
import { Cv } from './cv.entity';

@Entity()
export class Language extends LanguageCreate {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  languageId!: string;

  @IsUUID()
  @Column({ type: 'uuid', name: 'keycloak_id' })
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  keycloakId!: string;

  @Column({ type: 'varchar', name: 'language', length: 20 })
  language!: string;

  @Column({ type: 'int', name: 'level' })
  level!: LanguageLevel;

  @IsDate()
  @CreatedAtColumn()
  @Exclude()
  createdAt!: Date;

  @IsDate()
  @UpdatedAtColumn()
  @Exclude()
  updatedAt!: Date;

  @ManyToOne(() => Cv, cv => cv.languages, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'keycloak_id', referencedColumnName: 'keycloakId' })
  cv?: Cv;
}

export type LanguageId = typeof Language.prototype.languageId;
