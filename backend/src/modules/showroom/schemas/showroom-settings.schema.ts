import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShowroomSettingsDocument = ShowroomSettings & Document;

@Schema({ _id: false })
export class Address {
  @Prop() street: string;
  @Prop() suburb: string;
  @Prop() state: string;
  @Prop() postcode: string;
}
const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
export class OpeningHour {
  @Prop() day: string;
  @Prop() open: string;
  @Prop() close: string;
  @Prop({ default: false }) closed: boolean;
}
const OpeningHourSchema = SchemaFactory.createForClass(OpeningHour);

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ default: '' }) facebook: string;
  @Prop({ default: '' }) instagram: string;
  @Prop({ default: '' }) pinterest: string;
  @Prop({ default: '' }) youtube: string;
}
const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

@Schema({ _id: false })
export class WhyChooseUsItem {
  @Prop() title: string;
  @Prop() description: string;
  @Prop() icon: string;
}
const WhyChooseUsItemSchema = SchemaFactory.createForClass(WhyChooseUsItem);

@Schema({ _id: false })
export class SeoSettings {
  @Prop({ default: '' }) metaTitle: string;
  @Prop({ default: '' }) metaDescription: string;
  @Prop({ default: '' }) ogImage: string;
  @Prop({ type: [String], default: [] }) keywords: string[];
}
const SeoSettingsSchema = SchemaFactory.createForClass(SeoSettings);

@Schema({ timestamps: true })
export class ShowroomSettings {
  // === Company Info ===
  @Prop({ required: true }) companyName: string;
  @Prop() tagline: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true }) email: string;
  @Prop() secondaryPhone: string;
  @Prop() abn: string; // Australian Business Number

  // === Address ===
  @Prop({ type: AddressSchema, required: true }) address: Address;

  // === Opening Hours ===
  @Prop({ type: [OpeningHourSchema], default: [] }) openingHours: OpeningHour[];

  // === Maps ===
  @Prop() googleMapsUrl: string;
  @Prop() googleMapsEmbed: string;

  // === Social ===
  @Prop({ type: SocialLinksSchema }) socialLinks: SocialLinks;

  // === Homepage: Hero ===
  @Prop() heroTitle: string;
  @Prop() heroSubtitle: string;
  @Prop() heroImage: string;
  @Prop() heroCta1Text: string;
  @Prop() heroCta1Link: string;
  @Prop() heroCta2Text: string;
  @Prop() heroCta2Link: string;

  // === Homepage: About Short ===
  @Prop() aboutShort: string;

  // === Homepage: Why Choose Us ===
  @Prop({ type: [WhyChooseUsItemSchema], default: [] })
  whyChooseUs: WhyChooseUsItem[];

  // === SEO Settings ===
  @Prop({ type: SeoSettingsSchema }) seoSettings: SeoSettings;

  // === Footer Text ===
  @Prop() footerTagline: string;
  @Prop() copyrightText: string;

  // === Featured References ===
  @Prop({ type: [{ type: Types.ObjectId, ref: 'CatalogItem' }], default: [] })
  featuredCategoryIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }], default: [] })
  featuredProjectIds: Types.ObjectId[];

  // === AI Configuration ===
  @Prop({ default: '' }) aiSystemPrompt: string;
  @Prop({ default: true }) aiEnabled: boolean;
}

export const ShowroomSettingsSchema =
  SchemaFactory.createForClass(ShowroomSettings);
