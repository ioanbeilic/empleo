import { ApiModelProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import uuid from 'uuid/v4';
import { Document } from './document.entity';
import { Education } from './education.entity';
import { Experience } from './experience.entity';
import { Language } from './language.entity';

@Entity()
export class Cv {
  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @PrimaryColumn({ type: 'uuid', name: 'id', generated: false })
  cvId!: string;

  @IsUUID()
  @ApiModelProperty({ type: 'string', format: 'uuid', example: uuid() })
  @Column({ type: 'uuid', name: 'keycloak_id', unique: true })
  keycloakId!: string;

  @OneToMany(() => Education, education => education.cv)
  @ApiModelProperty({ type: [Education] })
  educations!: Education[];

  @OneToMany(() => Experience, experience => experience.cv)
  @ApiModelProperty({ type: [Experience] })
  experiences!: Experience[];

  @OneToMany(() => Language, language => language.cv)
  @ApiModelProperty({ type: [Language] })
  languages!: Language[];

  @OneToMany(() => Document, document => document.cv)
  @ApiModelProperty({ type: [Document] })
  documents!: Document[];
}

export type CvId = typeof Cv.prototype.cvId;
