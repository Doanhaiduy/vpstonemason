import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnquiryDocument = Enquiry & Document;

@Schema({ timestamps: true })
export class Enquiry {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  suburb: string;

  @Prop()
  projectType: string;

  @Prop()
  budgetRange: string;

  @Prop({ type: Types.ObjectId, ref: 'CatalogItem' })
  stoneId: Types.ObjectId;

  @Prop()
  stoneName: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    default: 'contact',
    enum: ['contact', 'quote', 'stone_enquiry', 'booking'],
  })
  source: string;

  @Prop({
    default: 'new',
    enum: ['new', 'in_progress', 'completed', 'archived'],
  })
  status: string;

  @Prop()
  internalNotes: string;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
EnquirySchema.index({ status: 1 });
EnquirySchema.index({ stoneId: 1 });
EnquirySchema.index({ createdAt: -1 });
