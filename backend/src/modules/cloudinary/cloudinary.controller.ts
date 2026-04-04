import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { Public } from '../../common/decorators';

interface CloudinarySignBody {
  folder?: string;
}

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Post('sign')
  signUpload(@Body() body: CloudinarySignBody = {}) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException('Cloudinary is not configured');
    }

    const folder =
      typeof body.folder === 'string' && body.folder.trim() !== ''
        ? body.folder.trim()
        : 'vpstonemason';

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash('sha1')
      .update(`${toSign}${apiSecret}`)
      .digest('hex');

    return {
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
    };
  }
}
