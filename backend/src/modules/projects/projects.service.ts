import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import slugify from 'slugify';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findAll(query: {
    application?: string;
    state?: string;
    stone?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const {
      application,
      state,
      stone,
      page = 1,
      limit = 9,
      sort = '-createdAt',
    } = query;
    const filter: FilterQuery<ProjectDocument> = { isActive: true };

    if (application) filter.applicationType = { $in: application.split(',') };
    if (state) filter['location.state'] = state;
    if (stone) filter.stoneIds = stone;

    const total = await this.projectModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const sortObj: any = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const data = await this.projectModel
      .find(filter)
      .populate('stoneIds', 'title slug imageMain imageSub')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, pagination: { page, limit, total, totalPages } };
  }

  async findBySlug(slug: string) {
    const project = await this.projectModel
      .findOne({ slug, isActive: true })
      .populate('stoneIds', 'title slug imageMain imageSub')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findById(id: string) {
    const project = await this.projectModel
      .findById(id)
      .populate('stoneIds', 'title slug imageMain imageSub')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findFeatured(limit = 4) {
    return this.projectModel
      .find({ isActive: true, isFeatured: true })
      .populate('stoneIds', 'title slug imageMain imageSub')
      .limit(limit)
      .exec();
  }

  async create(data: any) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const project = new this.projectModel({ ...data, slug });
    return (await project.save()).populate(
      'stoneIds',
      'title slug imageMain imageSub',
    );
  }

  async update(id: string, data: any) {
    if (data.name)
      data.slug = slugify(data.name, { lower: true, strict: true });
    const project = await this.projectModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('stoneIds', 'title slug imageMain imageSub')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async delete(id: string) {
    const project = await this.projectModel.findByIdAndDelete(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    return { message: 'Project deleted successfully' };
  }

  async count() {
    return this.projectModel.countDocuments({ isActive: true }).exec();
  }

  async findAllAdmin(query: {
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const {
      search,
      isActive,
      isFeatured,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = query;
    const filter: FilterQuery<ProjectDocument> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (search && search.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [
        { name: regex },
        { slug: regex },
        { description: regex },
        { 'location.suburb': regex },
        { 'location.state': regex },
      ];
    }

    const total = await this.projectModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const sortObj: any = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const data = await this.projectModel
      .find(filter)
      .populate('stoneIds', 'title slug imageMain imageSub')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, pagination: { page, limit, total, totalPages } };
  }
}
