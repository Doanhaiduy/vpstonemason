export interface CatalogItem {
  _id: string;
  type: 'category' | 'range' | 'product';
  title: string;
  slug: string;
  description: string;
  descriptionItem: string;
  imageMain: string;
  imageItem: string;
  imageDetail: string;
  imageSub: string[];
  parentId: string | null;
  sourceUrl: string;
  specifications: Record<string, string>;
  features?: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogBreadcrumbItem {
  title: string;
  slug: string;
  type: string;
}

export interface CatalogDetailResponse {
  item: CatalogItem;
  children: CatalogItem[];
  breadcrumb: CatalogBreadcrumbItem[];
  siblings: CatalogItem[];
}

export interface CatalogTreeNode extends CatalogItem {
  children: CatalogTreeNode[];
}

export interface CatalogFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogProductListItem extends CatalogItem {
  categorySlug: string;
  categoryTitle: string;
  rangeSlug: string;
  rangeTitle: string;
  finish: string;
}

export interface CatalogProductsResponse {
  data: CatalogProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: CatalogFilterOption[];
    ranges: CatalogFilterOption[];
    finishes: CatalogFilterOption[];
  };
  applied: {
    search: string;
    category: string;
    range: string;
    finish: string;
    sort: string;
  };
}
