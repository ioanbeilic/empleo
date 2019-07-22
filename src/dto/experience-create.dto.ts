import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Default } from 'empleo-nestjs-common';
import { Documentation } from '../domain/documentation';

export class ExperienceCreate {
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
  @ApiModelProperty({ type: 'text', example: 'D3.js implementation on Google AdWord' })
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

  @IsDate()
  @ApiModelProperty({ type: 'string', format: 'date', example: '2017-09-01' })
  startDate!: Date;

  @IsOptional()
  @IsDate()
  @ApiModelPropertyOptional({ type: 'string', format: 'date ', example: '2019-06-20' })
  endDate?: Date;
}
