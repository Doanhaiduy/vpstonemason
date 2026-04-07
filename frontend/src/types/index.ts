export interface Stone {
  _id: string;
  name: string;
  code: string;
  slug: string;
  categoryId: { _id: string; name: string; slug: string } | string;
  colourTags: string[];
  finish: string;
  thickness: string[];
  description: string;
  technicalSpecs: {
    waterAbsorption?: string;
    flexuralStrength?: string;
    abrasionResistance?: string;
    origin?: string;
    density?: string;
  };
  edgeProfiles: string[];
  applications: string[];
  careInstructions: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface StoneCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
  location: { suburb: string; state: string };
  applicationType: string[];
  description: string;
  stoneIds: { _id: string; name?: string; title?: string; slug: string }[];
  images: { url: string; alt: string; isCover: boolean }[];
  testimonial?: { clientName: string; text: string; rating: number };
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  suburb?: string;
  projectType?: string;
  budgetRange?: string;
  stoneId?: string;
  stoneName?: string;
  message: string;
  source: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  internalNotes?: string;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  thumbnail: string;
  images?: string[];
  authorName?: string;
  category?: string;
  tags: string[];
  authorId?: { firstName: string; lastName: string };
  status: 'draft' | 'published';
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
