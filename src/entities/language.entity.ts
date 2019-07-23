import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { CreatedAtColumn, UpdatedAtColumn } from 'empleo-nestjs-common';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { LanguageCreate } from '../dto/language-create.dto';

@Entity()
export class Language extends LanguageCreate {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  languageId!: string;

  @IsUUID()
  @Column({ type: 'uuid', name: 'keycloak_id' })

  // to implement on update
  /*
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @ManyToOne(type => Cv, cv => cv, { onDelete: 'CASCADE' })
  */
  @JoinColumn({ name: 'keycloak_id', referencedColumnName: 'keycloakId' })
  keycloakId!: string;

  @Column({ type: 'varchar', name: 'language', length: 20 })
  language!: string;

  @Column({ type: 'number', name: 'level' })
  level!: number;

  @IsDate()
  @CreatedAtColumn()
  @Exclude()
  createdAt!: Date;

  @IsDate()
  @UpdatedAtColumn()
  @Exclude()
  updatedAt!: Date;
}
