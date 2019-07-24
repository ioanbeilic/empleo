import { ApiModelProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class LanguageCreate {
  @IsString()
  @Length(1, 20)
  @ApiModelProperty({ type: 'string', maxLength: 20 })
  language!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @ApiModelProperty({ type: 'number', example: 1 })
  level!: number;
}
