import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Default } from 'empleo-nestjs-common';
import { AdditionalDocument } from '../domain/additional-document';

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

  @IsDate()
  @ApiModelProperty({ type: 'string', format: 'date', example: '2017-09-01' })
  startDate!: Date;

  @IsOptional()
  @IsDate()
  @ApiModelPropertyOptional({ type: 'string', format: 'date ', example: '2019-06-20' })
  endDate?: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  @Default(() => [])
  @Type(() => AdditionalDocument)
  @ApiModelPropertyOptional({ type: [AdditionalDocument] })
  documents?: AdditionalDocument[];
}
