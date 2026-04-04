import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ _id: false })
export class ProjectImage {
  @Prop({ required: true })
  url: string;

  @Prop()
  alt: string;

  @Prop({ default: false })
  isCover: boolean;
}

const ProjectImageSchema = SchemaFactory.createForClass(ProjectImage);

@Schema({ _id: false })
export class ProjectLocation {
  @Prop()
  suburb: string;

  @Prop()
  state: string;
}

const ProjectLocationSchema = SchemaFactory.createForClass(ProjectLocation);

@Schema({ _id: false })
export class Testimonial {
  @Prop()
  clientName: string;

  @Prop()
  text: string;

  @Prop({ min: 1, max: 5 })
  rating: number;
}

const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: ProjectLocationSchema })
  location: ProjectLocation;

  @Prop({ type: [String], default: [] })
  applicationType: string[];

  @Prop()
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'CatalogItem' }], default: [] })
  stoneIds: Types.ObjectId[];

  @Prop({ type: [ProjectImageSchema], default: [] })
  images: ProjectImage[];

  @Prop({ type: TestimonialSchema })
  testimonial: Testimonial;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  completedAt: Date;

  @Prop()
  seoTitle: string;

  @Prop()
  seoDescription: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ applicationType: 1 });
ProjectSchema.index({ isFeatured: 1 });
ProjectSchema.index({ stoneIds: 1 });
ProjectSchema.index({ createdAt: -1 });
