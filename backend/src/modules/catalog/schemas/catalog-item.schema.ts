import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CatalogItemDocument = CatalogItem & Document;

@Schema({ timestamps: true })
export class CatalogItem {
  @Prop({ required: true, enum: ['category', 'range', 'product'] })
  type: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionItem: string;

  @Prop({ default: '' })
  imageMain: string;

  @Prop({ default: '' })
  imageItem: string;

  @Prop({ default: '' })
  imageDetail: string;

  @Prop({ type: [String], default: [] })
  imageSub: string[];

  @Prop({ type: Types.ObjectId, ref: 'CatalogItem', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: '' })
  sourceUrl: string;

  @Prop({ type: Map, of: String, default: {} })
  specifications: Map<string, string>;

  @Prop({ type: [String], default: [] })
  features?: string[];

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CatalogItemSchema = SchemaFactory.createForClass(CatalogItem);

// Indexes for efficient queries
CatalogItemSchema.index({ type: 1, isActive: 1 });
CatalogItemSchema.index({ parentId: 1, isActive: 1 });
CatalogItemSchema.index({ slug: 1 }, { unique: true });
CatalogItemSchema.index({ displayOrder: 1 });
CatalogItemSchema.index({ title: 'text' });
