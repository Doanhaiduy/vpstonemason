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
