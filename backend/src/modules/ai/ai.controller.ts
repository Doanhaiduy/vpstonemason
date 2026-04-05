import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GenerateContentDto,
  GenerateDescriptionDto,
  GenerateFullPostDto,
  GenerateTitleDto,
} from './dto/generate-ai.dto';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @HttpCode(200)
  @Post('generate/title')
  generateTitle(@Body() body: GenerateTitleDto) {
    return this.aiService.generateTitle(body.topic, body.keywords);
  }

  @HttpCode(200)
  @Post('generate/description')
  generateDescription(@Body() body: GenerateDescriptionDto) {
    return this.aiService.generateDescription(body.title, body.keywords);
  }

  @HttpCode(200)
  @Post('generate/content')
  generateContent(@Body() body: GenerateContentDto) {
    return this.aiService.generateContent(
      body.title,
      body.description,
      body.keywords,
    );
  }

  @HttpCode(200)
  @Post('generate/full')
  generateFull(@Body() body: GenerateFullPostDto): Promise<any> {
    return this.aiService.generateFullPost({
      topic: body.topic,
      category: body.category,
      keywords: body.keywords,
    });
  }
}
