import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ShowroomSettings,
  ShowroomSettingsDocument,
} from './schemas/showroom-settings.schema';
import { siteDefaults } from '../../config/site-defaults';

@Injectable()
export class ShowroomService {
  constructor(
    @InjectModel(ShowroomSettings.name)
    private settingsModel: Model<ShowroomSettingsDocument>,
  ) {}

  async getSettings() {
    let settings = await this.settingsModel
      .findOne()
      .populate('featuredCategoryIds', 'title slug imageMain description')
      .populate(
        'featuredProjectIds',
        'name slug images location applicationType',
      )
      .exec();

    if (!settings) {
      // Create from site-defaults.ts (config file layer)
      settings = await this.settingsModel.create(siteDefaults);
    }

    return settings;
  }

  async updateSettings(data: any) {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({ ...siteDefaults, ...data });
    } else {
      // Deep merge: handle nested objects like address, socialLinks, seoSettings
      if (data.address) {
        const existing =
          (settings.address as any)?.toObject?.() || settings.address || {};
        data.address = { ...existing, ...data.address };
      }
      if (data.socialLinks) {
        const existing =
          (settings.socialLinks as any)?.toObject?.() ||
          settings.socialLinks ||
          {};
        data.socialLinks = { ...existing, ...data.socialLinks };
      }
      if (data.seoSettings) {
        const existing =
          (settings.seoSettings as any)?.toObject?.() ||
          settings.seoSettings ||
          {};
        data.seoSettings = { ...existing, ...data.seoSettings };
      }
      Object.assign(settings, data);
      await settings.save();
    }
    return this.getSettings();
  }
}
