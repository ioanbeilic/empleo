import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Default } from 'empleo-nestjs-common';
import { Documentation } from '../domain/documentation';

export class ExperienceCreate {
  @ApiModelProperty({ type: 'string', format: 'YYYY-MM-DD', example: '2019-07-10T00:00:00.000Z' })
  startDate!: Date;

  @ApiModelPropertyOptional({ type: 'string', format: 'YYYY-MM-DD ', example: '2019-07-10T00:00:08.000Z' })
  endDate?: Date;

  @IsString()
  @Length(1, 50)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 40, example: 'Google LLC' })
  companyName!: string;

  @IsString()
  @Length(1, 100)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 100, example: 'Programmer' })
  position!: string;

  @IsString()
  @Length(20)
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
