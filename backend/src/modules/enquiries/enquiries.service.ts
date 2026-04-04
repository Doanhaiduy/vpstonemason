import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Enquiry, EnquiryDocument } from './schemas/enquiry.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name) private enquiryModel: Model<EnquiryDocument>,
    private mailService: MailService,
  ) {}

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    suburb?: string;
    projectType?: string;
    budgetRange?: string;
    stoneId?: string;
    stoneName?: string;
    message: string;
    source?: string;
  }) {
    const enquiry = new this.enquiryModel(data);
    await enquiry.save();

    // Send notification email to admin
    this.mailService.sendEnquiryNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      suburb: data.suburb,
      projectType: data.projectType,
      budgetRange: data.budgetRange,
      message: data.message,
      stoneName: data.stoneName,
    });

    // Send auto-reply to customer
    this.mailService.sendAutoReply(data.email, data.name);

    return {
      message: "Thank you! We'll be in touch within 24 hours.",
      id: enquiry._id,
    };
  }

  async findAll(query: {
    status?: string;
    source?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const {
      status,
      source,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = query;
    const filter: FilterQuery<EnquiryDocument> = {};

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (search && search.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { suburb: regex },
        { stoneName: regex },
        { projectType: regex },
        { message: regex },
      ];
    }

    const total = await this.enquiryModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const sortObj: any = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const data = await this.enquiryModel
      .find(filter)
      .populate('stoneId', 'title slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, pagination: { page, limit, total, totalPages } };
  }

  async findById(id: string) {
    const enquiry = await this.enquiryModel
      .findById(id)
      .populate('stoneId', 'title slug')
      .exec();
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async update(id: string, data: { status?: string; internalNotes?: string }) {
    const enquiry = await this.enquiryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async delete(id: string) {
    const enquiry = await this.enquiryModel.findByIdAndDelete(id).exec();
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return { message: 'Enquiry deleted successfully' };
  }

  async countNew() {
    return this.enquiryModel.countDocuments({ status: 'new' }).exec();
  }
}
