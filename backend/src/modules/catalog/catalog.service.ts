import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import {
  CatalogItem,
  CatalogItemDocument,
} from './schemas/catalog-item.schema';

type CatalogType = 'category' | 'range' | 'product';

interface CatalogAdminQuery {
  type?: string;
  parentId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  includeInactive?: boolean;
  isActive?: boolean;
}

interface CatalogProductsQuery {
  search?: string;
  category?: string;
  range?: string;
  finish?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface CatalogAdminPayload {
  type?: string;
  title?: string;
  slug?: string;
  description?: string;
  descriptionItem?: string;
  imageMain?: string;
  imageItem?: string;
  imageDetail?: string;
  imageSub?: string[];
  parentId?: string | null;
  sourceUrl?: string;
  specifications?: Record<string, string>;
  features?: string[];
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(CatalogItem.name)
    private catalogModel: Model<CatalogItemDocument>,
  ) {}

  private normalizeCatalogType(type?: string): CatalogType {
    const normalized = (type || '').toLowerCase();
    if (
      normalized === 'category' ||
      normalized === 'range' ||
      normalized === 'product'
    ) {
      return normalized;
    }
    throw new BadRequestException('Invalid catalog type');
  }

  private normalizeStringArray(values: unknown): string[] {
    if (!Array.isArray(values)) return [];

    const seen = new Set<string>();
    const result: string[] = [];

    for (const value of values) {
      const text = String(value || '').trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      result.push(text);
    }

    return result;
  }

  private normalizeSpecifications(
    specifications: unknown,
  ): Record<string, string> {
    if (!specifications || typeof specifications !== 'object') {
      return {};
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      specifications as Record<string, unknown>,
    )) {
      const normalizedKey = String(key || '').trim();
      if (!normalizedKey) continue;
      result[normalizedKey] = String(value || '').trim();
    }

    return result;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    const base = baseSlug || `catalog-item-${Date.now()}`;
    let slug = base;
    let suffix = 1;

    while (true) {
      const existing = await this.catalogModel
        .findOne({
          slug,
          ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        })
        .select('_id')
        .lean()
        .exec();

      if (!existing) return slug;
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
  }

  private async resolveParent(
    type: CatalogType,
    parentId?: string | null,
  ): Promise<Types.ObjectId | null> {
    if (type === 'category') return null;

    if (!parentId || !Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException(`${type} requires a valid parentId`);
    }

    const parent = await this.catalogModel
      .findById(parentId)
      .select('_id type')
      .lean()
      .exec();

    if (!parent) throw new NotFoundException('Parent item not found');

    const expectedParentType = type === 'range' ? 'category' : 'range';
    if (parent.type !== expectedParentType) {
      throw new BadRequestException(
        `${type} parent must be a ${expectedParentType}`,
      );
    }

    return new Types.ObjectId(parentId);
  }

  private parseSort(sort?: string): Record<string, 1 | -1> {
    const sortBy = (sort || 'displayOrder').trim();
    if (!sortBy) return { displayOrder: 1 };

    if (sortBy.startsWith('-')) {
      return { [sortBy.slice(1)]: -1 };
    }

    return { [sortBy]: 1 };
  }

  private normalizeFilterValue(value?: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private normalizePublicSort(sort?: string):
    | 'featured'
    | 'title-asc'
    | 'title-desc'
    | 'newest' {
    const normalized = this.normalizeFilterValue(sort);
    if (
      normalized === 'title-asc' ||
      normalized === 'title-desc' ||
      normalized === 'newest'
    ) {
      return normalized;
    }
    return 'featured';
  }

  private getSpecificationsEntries(
    specifications: unknown,
  ): Array<[string, string]> {
    if (!specifications || typeof specifications !== 'object') {
      return [];
    }

    if (specifications instanceof Map) {
      return Array.from(specifications.entries()).map(([key, value]) => [
        String(key || ''),
        String(value || ''),
      ]);
    }

    return Object.entries(specifications as Record<string, unknown>).map(
      ([key, value]) => [String(key || ''), String(value || '')],
    );
  }

  private extractFinishValue(specifications: unknown): string {
    const entries = this.getSpecificationsEntries(specifications);

    for (const [key, value] of entries) {
      if (!/finish|surface/i.test(key)) continue;
      const normalizedValue = String(value || '').trim();
      if (normalizedValue) return normalizedValue;
    }

    return '';
  }

  private splitFacetValues(value: string): string[] {
    return String(value || '')
      .split(/[;,|/]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private sortCatalogProducts(items: any[], sort: string): any[] {
    const sorted = [...items];

    if (sort === 'title-asc') {
      sorted.sort((a, b) =>
        String(a.title || '').localeCompare(String(b.title || ''), undefined, {
          sensitivity: 'base',
        }),
      );
      return sorted;
    }

    if (sort === 'title-desc') {
      sorted.sort((a, b) =>
        String(b.title || '').localeCompare(String(a.title || ''), undefined, {
          sensitivity: 'base',
        }),
      );
      return sorted;
    }

    if (sort === 'newest') {
      sorted.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      return sorted;
    }

    // Featured/default ordering keeps CMS displayOrder first.
    sorted.sort((a, b) => {
      const orderDiff = Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
      if (orderDiff !== 0) return orderDiff;

      return String(a.title || '').localeCompare(String(b.title || ''), undefined, {
        sensitivity: 'base',
      });
    });
    return sorted;
  }

  /**
   * Get all top-level categories
   */
  async getCategories() {
    return this.catalogModel
      .find({ type: 'category', isActive: true, parentId: null })
      .sort({ displayOrder: 1 })
      .exec();
  }

  /**
   * Get a single item by slug, including its direct children
   */
  async getBySlug(slug: string) {
    const item = await this.catalogModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!item) throw new NotFoundException('Catalog item not found');

    const children = await this.catalogModel
      .find({ parentId: item._id, isActive: true })
      .sort({ displayOrder: 1 })
      .exec();

    return { item, children };
  }

  /**
   * Get direct children of an item
   */
  async getChildren(slug: string) {
    const parent = await this.catalogModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!parent) throw new NotFoundException('Parent item not found');

    return this.catalogModel
      .find({ parentId: parent._id, isActive: true })
      .sort({ displayOrder: 1 })
      .exec();
  }

  /**
   * Build breadcrumb trail from item to root
   */
  async getBreadcrumb(slug: string) {
    const item = await this.catalogModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!item) throw new NotFoundException('Item not found');

    const breadcrumb: { title: string; slug: string; type: string }[] = [];
    let current: CatalogItemDocument | null = item;

    while (current) {
      breadcrumb.unshift({
        title: current.title,
        slug: current.slug,
        type: current.type,
      });
      if (current.parentId) {
        current = await this.catalogModel.findById(current.parentId).exec();
      } else {
        current = null;
      }
    }

    return breadcrumb;
  }

  /**
   * Get full navigation tree (categories → ranges → products)
   */
  async getTree() {
    const allItems = await this.catalogModel
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean()
      .exec();

    // Build tree from flat list
    const itemMap = new Map<string, any>();
    const tree: any[] = [];

    for (const item of allItems) {
      itemMap.set(item._id.toString(), { ...item, children: [] });
    }

    for (const item of allItems) {
      const node = itemMap.get(item._id.toString());
      if (item.parentId) {
        const parent = itemMap.get(item.parentId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else if (item.type === 'category') {
        tree.push(node);
      }
    }

    return tree;
  }

  async getProducts(query: CatalogProductsQuery) {
    const search = String(query.search || '').trim();
    const categoryFilter = this.normalizeFilterValue(query.category);
    const rangeFilter = this.normalizeFilterValue(query.range);
    const finishFilter = this.normalizeFilterValue(query.finish);
    const sort = this.normalizePublicSort(query.sort);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(60, Math.max(1, Number(query.limit) || 12));

    const [categories, ranges] = await Promise.all([
      this.catalogModel
        .find({ type: 'category', isActive: true })
        .select('_id title slug')
        .lean()
        .exec(),
      this.catalogModel
        .find({ type: 'range', isActive: true })
        .select('_id title slug parentId')
        .lean()
        .exec(),
    ]);

    const categoriesById = new Map<string, any>();
    for (const category of categories) {
      categoriesById.set(String(category._id), category);
    }

    const rangesById = new Map<string, any>();
    for (const range of ranges) {
      rangesById.set(String(range._id), range);
    }

    const selectedCategory = categoryFilter
      ? categories.find(
          (category) =>
            this.normalizeFilterValue(String(category.slug || '')) ===
            categoryFilter,
        ) || null
      : null;

    const selectedRange = rangeFilter
      ? ranges.find(
          (range) =>
            this.normalizeFilterValue(String(range.slug || '')) === rangeFilter,
        ) || null
      : null;

    let allowedRanges = ranges;
    if (selectedCategory) {
      const selectedCategoryId = String(selectedCategory._id);
      allowedRanges = allowedRanges.filter(
        (range) => String(range.parentId) === selectedCategoryId,
      );
    }

    if (selectedRange) {
      const selectedRangeId = String(selectedRange._id);
      const rangeBelongsToCategory = !selectedCategory
        ? true
        : String(selectedRange.parentId) === String(selectedCategory._id);

      allowedRanges =
        rangeBelongsToCategory &&
        allowedRanges.some((range) => String(range._id) === selectedRangeId)
          ? [selectedRange]
          : [];
    }

    const allowedRangeIds = allowedRanges
      .map((range) => String(range._id))
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const filter: any = {
      type: 'product',
      isActive: true,
      parentId: { $in: allowedRangeIds },
    };

    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { descriptionItem: regex },
        { slug: regex },
      ];
    }

    const products = await this.catalogModel
      .find(filter)
      .select(
        '_id type title slug description descriptionItem imageMain imageItem imageDetail imageSub parentId sourceUrl specifications features displayOrder isActive createdAt updatedAt',
      )
      .lean()
      .exec();

    const enriched = products
      .map((product: any) => {
        const range = rangesById.get(String(product.parentId || ''));
        if (!range) return null;

        const category = categoriesById.get(String(range.parentId || ''));
        if (!category) return null;

        return {
          ...product,
          rangeSlug: String(range.slug || ''),
          rangeTitle: String(range.title || ''),
          categorySlug: String(category.slug || ''),
          categoryTitle: String(category.title || ''),
          finish: this.extractFinishValue(product.specifications),
        };
      })
      .filter(Boolean) as any[];

    const categoryFacetMap = new Map<
      string,
      { value: string; label: string; count: number }
    >();
    const rangeFacetMap = new Map<
      string,
      { value: string; label: string; count: number }
    >();
    const finishFacetMap = new Map<
      string,
      { value: string; label: string; count: number }
    >();

    for (const item of enriched) {
      if (item.categorySlug) {
        const existingCategoryFacet = categoryFacetMap.get(item.categorySlug) || {
          value: item.categorySlug,
          label: item.categoryTitle || item.categorySlug,
          count: 0,
        };
        existingCategoryFacet.count += 1;
        categoryFacetMap.set(item.categorySlug, existingCategoryFacet);
      }

      if (item.rangeSlug) {
        const existingRangeFacet = rangeFacetMap.get(item.rangeSlug) || {
          value: item.rangeSlug,
          label: item.rangeTitle || item.rangeSlug,
          count: 0,
        };
        existingRangeFacet.count += 1;
        rangeFacetMap.set(item.rangeSlug, existingRangeFacet);
      }

      for (const finishToken of this.splitFacetValues(item.finish)) {
        const normalizedToken = this.normalizeFilterValue(finishToken);
        if (!normalizedToken) continue;

        const existingFinishFacet = finishFacetMap.get(normalizedToken) || {
          value: normalizedToken,
          label: finishToken,
          count: 0,
        };
        existingFinishFacet.count += 1;
        finishFacetMap.set(normalizedToken, existingFinishFacet);
      }
    }

    const finishFiltered = finishFilter
      ? enriched.filter((item) => {
          const finishTokens = this.splitFacetValues(item.finish).map((token) =>
            this.normalizeFilterValue(token),
          );

          return (
            finishTokens.includes(finishFilter) ||
            this.normalizeFilterValue(item.finish).includes(finishFilter)
          );
        })
      : enriched;

    const sorted = this.sortCatalogProducts(finishFiltered, sort);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * limit;
    const paginated = sorted.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
      filters: {
        categories: Array.from(categoryFacetMap.values()).sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
        ),
        ranges: Array.from(rangeFacetMap.values()).sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
        ),
        finishes: Array.from(finishFacetMap.values()).sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
        ),
      },
      applied: {
        search,
        category: selectedCategory ? String(selectedCategory.slug || '') : categoryFilter,
        range: selectedRange ? String(selectedRange.slug || '') : rangeFilter,
        finish: finishFilter,
        sort,
      },
    };
  }

  /**
   * Get item by slug with full context: siblings, parent info
   */
  async getItemDetail(slug: string) {
    const item = await this.catalogModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!item) throw new NotFoundException('Catalog item not found');

    const [children, breadcrumb] = await Promise.all([
      this.catalogModel
        .find({ parentId: item._id, isActive: true })
        .sort({ displayOrder: 1 })
        .exec(),
      this.getBreadcrumb(slug),
    ]);

    // Get siblings (other items with same parent)
    let siblings: CatalogItemDocument[] = [];
    if (item.parentId) {
      siblings = await this.catalogModel
        .find({
          parentId: item.parentId,
          isActive: true,
          _id: { $ne: item._id },
        })
        .sort({ displayOrder: 1 })
        .limit(6)
        .exec();
    }

    return { item, children, breadcrumb, siblings };
  }

  async getAdminTree() {
    const allItems = await this.catalogModel
      .find({})
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()
      .exec();

    const itemMap = new Map<string, any>();
    const tree: any[] = [];

    for (const item of allItems) {
      itemMap.set(item._id.toString(), { ...item, children: [] });
    }

    for (const item of allItems) {
      const node = itemMap.get(item._id.toString());
      if (item.parentId) {
        const parent = itemMap.get(item.parentId.toString());
        if (parent) parent.children.push(node);
      } else if (item.type === 'category') {
        tree.push(node);
      }
    }

    return tree;
  }

  async getAdminItems(query: CatalogAdminQuery) {
    const {
      type,
      parentId,
      categoryId,
      search,
      page = 1,
      limit = 50,
      sort,
      includeInactive = true,
      isActive,
    } = query;

    const filter: any = {};

    if (type) {
      filter.type = this.normalizeCatalogType(type);
    }

    if (parentId === 'null') {
      filter.parentId = null;
    } else if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('Invalid parentId');
      }
      filter.parentId = new Types.ObjectId(parentId);
    }

    if (categoryId) {
      if (parentId) {
        throw new BadRequestException(
          'Use either parentId or categoryId filter, not both',
        );
      }

      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }

      if (filter.type && filter.type !== 'product') {
        throw new BadRequestException(
          'categoryId filter is only supported for product type',
        );
      }

      filter.type = 'product';

      const rangeRows = await this.catalogModel
        .find({
          type: 'range',
          parentId: new Types.ObjectId(categoryId),
        })
        .select('_id')
        .lean()
        .exec();

      filter.parentId = {
        $in: rangeRows.map((range) => range._id),
      };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    } else if (!includeInactive) {
      filter.isActive = true;
    }

    if (search && search.trim()) {
      const escaped = this.escapeRegex(search.trim());
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { slug: regex }];
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
    const skip = (safePage - 1) * safeLimit;

    const [total, data] = await Promise.all([
      this.catalogModel.countDocuments(filter).exec(),
      this.catalogModel
        .find(filter)
        .populate('parentId', 'title slug type')
        .sort(this.parseSort(sort))
        .skip(skip)
        .limit(safeLimit)
        .exec(),
    ]);

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getAdminItemById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid item id');
    }

    const item = await this.catalogModel
      .findById(id)
      .populate('parentId', 'title slug type')
      .exec();

    if (!item) throw new NotFoundException('Catalog item not found');

    const children = await this.catalogModel
      .find({ parentId: item._id })
      .sort({ displayOrder: 1, createdAt: 1 })
      .exec();

    return { item, children };
  }

  async createAdminItem(payload: CatalogAdminPayload) {
    const type = this.normalizeCatalogType(payload.type);
    const title = String(payload.title || '').trim();
    if (!title) throw new BadRequestException('Title is required');

    const parentId = await this.resolveParent(type, payload.parentId);

    const slugBase = slugify(payload.slug || title, {
      lower: true,
      strict: true,
      trim: true,
    });
    const slug = await this.ensureUniqueSlug(slugBase);

    const data: any = {
      type,
      title,
      slug,
      description: String(payload.description || '').trim(),
      descriptionItem: String(payload.descriptionItem || '').trim(),
      imageMain: String(payload.imageMain || '').trim(),
      imageItem: String(payload.imageItem || '').trim(),
      imageDetail: String(payload.imageDetail || '').trim(),
      imageSub: this.normalizeStringArray(payload.imageSub),
      parentId,
      sourceUrl: String(payload.sourceUrl || '').trim(),
      specifications:
        type === 'product'
          ? this.normalizeSpecifications(payload.specifications)
          : {},
      features:
        type === 'product' ? this.normalizeStringArray(payload.features) : [],
      displayOrder: Number(payload.displayOrder || 0),
      isActive: payload.isActive !== false,
    };

    return this.catalogModel.create(data);
  }

  async updateAdminItem(id: string, payload: CatalogAdminPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid item id');
    }

    const item = await this.catalogModel.findById(id).exec();
    if (!item) throw new NotFoundException('Catalog item not found');

    if (payload.type && payload.type !== item.type) {
      throw new BadRequestException('Changing item type is not supported');
    }

    if (payload.parentId !== undefined) {
      item.parentId = await this.resolveParent(
        item.type as CatalogType,
        payload.parentId,
      );
    }

    if (payload.title !== undefined) {
      const title = String(payload.title || '').trim();
      if (!title) throw new BadRequestException('Title cannot be empty');
      item.title = title;
    }

    if (payload.slug !== undefined || payload.title !== undefined) {
      const slugBase = slugify(payload.slug || item.title, {
        lower: true,
        strict: true,
        trim: true,
      });
      item.slug = await this.ensureUniqueSlug(slugBase, id);
    }

    if (payload.description !== undefined) {
      item.description = String(payload.description || '').trim();
    }

    if (payload.descriptionItem !== undefined) {
      item.descriptionItem = String(payload.descriptionItem || '').trim();
    }

    if (payload.imageMain !== undefined) {
      item.imageMain = String(payload.imageMain || '').trim();
    }

    if (payload.imageItem !== undefined) {
      item.imageItem = String(payload.imageItem || '').trim();
    }

    if (payload.imageDetail !== undefined) {
      item.imageDetail = String(payload.imageDetail || '').trim();
    }

    if (payload.imageSub !== undefined) {
      item.imageSub = this.normalizeStringArray(payload.imageSub);
    }

    if (payload.sourceUrl !== undefined) {
      item.sourceUrl = String(payload.sourceUrl || '').trim();
    }

    if (payload.displayOrder !== undefined) {
      item.displayOrder = Number(payload.displayOrder || 0);
    }

    if (payload.isActive !== undefined) {
      item.isActive = payload.isActive !== false;
    }

    if (item.type === 'product') {
      if (payload.specifications !== undefined) {
        item.specifications = this.normalizeSpecifications(
          payload.specifications,
        ) as any;
      }
      if (payload.features !== undefined) {
        item.features = this.normalizeStringArray(payload.features);
      }
    }

    await item.save();
    return item;
  }

  async deleteAdminItem(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid item id');
    }

    const item = await this.catalogModel.findById(id).select('_id').exec();
    if (!item) throw new NotFoundException('Catalog item not found');

    const childrenCount = await this.catalogModel
      .countDocuments({ parentId: item._id })
      .exec();

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete item with children. Delete child items first.',
      );
    }

    await this.catalogModel.findByIdAndDelete(id).exec();
    return { message: 'Catalog item deleted successfully' };
  }
}
