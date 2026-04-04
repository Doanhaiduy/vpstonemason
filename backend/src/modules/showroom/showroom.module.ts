import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShowroomService } from './showroom.service';
import { ShowroomController } from './showroom.controller';
import {
  ShowroomSettings,
  ShowroomSettingsSchema,
} from './schemas/showroom-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShowroomSettings.name, schema: ShowroomSettingsSchema },
    ]),
  ],
  controllers: [ShowroomController],
  providers: [ShowroomService],
  exports: [ShowroomService],
})
export class ShowroomModule {}
