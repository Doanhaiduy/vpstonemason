import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

function toKeywordArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const normalized = source
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 8);

  return normalized.length > 0 ? normalized : undefined;
}

export class GenerateTitleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  topic!: string;

  @IsOptional()
  @Transform(({ value }) => toKeywordArray(value))
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  keywords?: string[];
}

export class GenerateDescriptionDto {
  @IsString()
  @MinLength(8)
  @MaxLength(220)
  title!: string;

  @IsOptional()
  @Transform(({ value }) => toKeywordArray(value))
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  keywords?: string[];
}

export class GenerateContentDto {
  @IsString()
  @MinLength(8)
  @MaxLength(220)
  title!: string;

  @IsString()
  @MinLength(16)
  @MaxLength(420)
  description!: string;

  @IsOptional()
  @Transform(({ value }) => toKeywordArray(value))
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  keywords?: string[];
}

export class GenerateFullPostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(260)
  topic!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @Transform(({ value }) => toKeywordArray(value))
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  keywords?: string[];
}
