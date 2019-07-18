import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Default } from 'empleo-nestjs-common';
import { Documentation } from '../domain/documentation';

export class ExperienceCreate {
  @ApiModelProperty({ type: 'date', format: 'YYYY-MM-DD', example: '2019-07-10T12:40:18.858Z' })
  dateStart!: Date;

  @ApiModelProperty({ type: 'date', format: 'YYYY-MM-DD ', example: '2019-07-10T12:40:18.858Z' })
  dateEnd!: Date;

  @IsString()
  @Length(1, 50)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 40, example: 'Google LLC' })
  companyName!: string;

  @IsString()
  @Length(1, 100)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 100, example: 'Programmer' })
  position!: string;

  @IsString()
  @ApiModelProperty({ type: 'text', example: 'D3.js implementation on Google Adword' })
  description!: string;

  @IsString()
  @Length(1, 100)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 100, example: 'Front end developer' })
  title!: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Default(() => [])
  @Type(() => Documentation)
  @ApiModelPropertyOptional({ type: [Documentation] })
  documentation?: Documentation[];
}
