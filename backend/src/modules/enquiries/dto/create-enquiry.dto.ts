import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const ENQUIRY_SOURCES = [
  'contact',
  'quote',
  'stone_enquiry',
  'booking',
] as const;

export class CreateEnquiryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(160)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  suburb?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  projectType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  budgetRange?: string;

  @IsOptional()
  @IsMongoId()
  stoneId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  stoneName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsEnum(ENQUIRY_SOURCES)
  source?: (typeof ENQUIRY_SOURCES)[number];
}
