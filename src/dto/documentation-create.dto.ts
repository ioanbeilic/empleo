import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { Default } from 'empleo-nestjs-common';

export class DocumentationCreate {
  @IsString()
  @Length(1, 255)
  @ApiModelPropertyOptional({
    type: 'string',
    maxLength: 255,
    example: 'Title of Bachelor Telecommunication Engineering'
  })
  name!: string;

  @IsOptional()
  @IsUrl()
  @Default(null)
  @Length(0, 255)
  @ApiModelPropertyOptional({ type: 'string', maxLength: 255, example: 'https://example.com/profile/certification' })
  url!: string | null;
}
