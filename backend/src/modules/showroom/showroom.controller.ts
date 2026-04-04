import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ShowroomService } from './showroom.service';
import { Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('showroom')
export class ShowroomController {
  constructor(private showroomService: ShowroomService) {}

  @Public()
  @Get()
  getSettings() {
    return this.showroomService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateSettings(@Body() body: any) {
    return this.showroomService.updateSettings(body);
  }
}
