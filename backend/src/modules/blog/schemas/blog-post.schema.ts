import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogPostDocument = BlogPost & Document;

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop()
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  featuredImage: string;

  @Prop()
  thumbnail: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ trim: true })
  authorName: string;

  @Prop({ trim: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  authorId: Types.ObjectId;

  @Prop({ default: 'draft', enum: ['draft', 'published'] })
  status: string;

  @Prop()
  publishedAt: Date;

  @Prop()
  seoTitle: string;

  @Prop()
  seoDescription: string;

  @Prop()
  readTime: number;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ category: 1, publishedAt: -1 });
BlogPostSchema.index({ title: 'text' });
