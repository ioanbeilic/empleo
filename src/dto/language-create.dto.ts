import { ApiModelProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';
import { max, min } from 'lodash';
import { allowedLanguageLevels, LanguageLevel } from '../domain/language-level.enum';

export class LanguageCreate {
  @IsString()
  @Length(1, 20)
  @ApiModelProperty({
    type: 'string',
    maxLength: 20,
    description: 'Language locale identifier',
    example: 'es'
  })
  language!: string;

  @IsInt()
  @Min(min(allowedLanguageLevels)!)
  @Max(max(allowedLanguageLevels)!)
  @ApiModelProperty({
    type: 'integer',
    enum: allowedLanguageLevels,
    description: 'Language level. Being `0` a beginner and `5` a native speaker',
    example: LanguageLevel.Intermediate
  })
  level!: LanguageLevel;
}
