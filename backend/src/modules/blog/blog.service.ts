import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import slugify from 'slugify';
import { BlogPost, BlogPostDocument } from './schemas/blog-post.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogPost.name) private blogModel: Model<BlogPostDocument>,
  ) {}

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findAllPublished(query: {
    tag?: string;
    page?: number;
    limit?: number;
  }) {
    const { tag, page = 1, limit = 9 } = query;
    const filter: FilterQuery<BlogPostDocument> = { status: 'published' };
    if (tag) filter.tags = tag;

    const total = await this.blogModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await this.blogModel
      .find(filter)
      .populate('authorId', 'firstName lastName')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, pagination: { page, limit, total, totalPages } };
  }

  async findBySlug(slug: string) {
    const post = await this.blogModel
      .findOne({ slug, status: 'published' })
      .populate('authorId', 'firstName lastName')
      .exec();
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findById(id: string) {
    const post = await this.blogModel
      .findById(id)
      .populate('authorId', 'firstName lastName')
      .exec();
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findAllAdmin(query: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const { status, search, page = 1, limit = 20, sort = '-createdAt' } = query;
    const filter: FilterQuery<BlogPostDocument> = {};
    if (status) filter.status = status;

    if (search && search.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [
        { title: regex },
        { excerpt: regex },
        { content: regex },
        { slug: regex },
        { tags: regex },
      ];
    }

    const total = await this.blogModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const sortObj: any = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const data = await this.blogModel
      .find(filter)
      .populate('authorId', 'firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, pagination: { page, limit, total, totalPages } };
  }

  async create(data: any) {
    const slug = slugify(data.title, { lower: true, strict: true });
    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = new this.blogModel({ ...data, slug });
    return post.save();
  }

  async update(id: string, data: any) {
    if (data.title)
      data.slug = slugify(data.title, { lower: true, strict: true });
    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = await this.blogModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async delete(id: string) {
    const post = await this.blogModel.findByIdAndDelete(id).exec();
    if (!post) throw new NotFoundException('Blog post not found');
    return { message: 'Blog post deleted successfully' };
  }

  async countPublished() {
    return this.blogModel.countDocuments({ status: 'published' }).exec();
  }
}
