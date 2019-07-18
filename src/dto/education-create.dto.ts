import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Default } from 'empleo-nestjs-common';
import { Documentation } from '../domain/documentation';

export class EducationCreate {
  @IsString()
  @Length(1, 40)
  @ApiModelProperty({ type: 'string', format: 'string', minLength: 1, maxLength: 40, example: 'College' })
  centerType!: string;

  @IsString()
  @Length(1, 40)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 40, example: 'ES' })
  country!: string;

  @IsString()
  @Length(1, 40)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 40, example: 'University of Vigo' })
  centerName!: string;

  @IsString()
  @Length(1, 100)
  @ApiModelProperty({
    type: 'string',
    minLength: 1,
    maxLength: 100,
    example: 'Bachelor of Telecommunication Engineering'
  })
  title!: string;

  @IsString()
  @Length(1, 255)
  @ApiModelProperty({ type: 'string', minLength: 1, maxLength: 255, example: 'Technology and Information' })
  category!: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Default(() => [])
  @Type(() => Documentation)
  @ApiModelPropertyOptional({ type: [Documentation] })
  documentation?: Documentation[];
}