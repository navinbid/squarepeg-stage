import {PortableTextBlock} from '@sanity/types';

export interface SanityCollectionType {
  _createdAt: Date;
  _rev: string;
  _type: string;
  _id: string;
  store: {
    gid: string;
    imageUrl?: string;
    sortOrder: string;
    descriptionHtml: string;
    slug: Slug;
    createdAt: Date;
    id: number;
    isDeleted: boolean;
    title: string;
    index?: number;
  };
  _updatedAt: Date;
}

export interface SanitySubcollectionType {
  image: Image;
  _type: string;
  name: string;
  _id: string;
  parentCollection: {
    title: string;
    slug: Slug;
  };
  _createdAt: Date;
  _rev: string;
  _updatedAt: Date;
  slug: Slug;
}

export interface Image {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
  };
}

export interface Slug {
  current: string;
  _type: string;
}

export interface FilterValue {
  value: string;
  name: string;
  _key: string;
}

export interface Option {
  _type: string;
  name: string;
  _key: string;
  values: string[];
}

export interface PriceRange {
  maxVariantPrice: number;
  minVariantPrice: number;
}

export interface Variant {
  title: string;
  price: number;
  image: null;
  _rev: string;
  _updatedAt: Date;
  sku: string;
  prices: number[];
  _createdAt: Date;
  _type: string;
  store: Store;
  id: number;
  _id: string;
  gid: string;
  compareAtPrice: number;
}

export interface Store {
  option2: string;
  gid: string;
  option1: string;
  status: string;
  compareAtPrice: number;
  price: number;
  sku: string;
  productId: number;
  isDeleted: boolean;
  id: number;
  productGid: string;
  title: string;
  createdAt: Date;
  inventory: Inventory;
  option3: string;
}

export interface Inventory {
  management: string;
  policy: string;
  isAvailable: boolean;
}

export interface SanityProduct {
  productType: string;
  gid: string;
  filterValues: FilterValue[];
  isDeleted: boolean;
  priceRange: PriceRange;
  variants: Variant[];
  createdAt: Date;
  id: number;
  previewImageUrl: string;
  descriptionHtml: string;
  vendor: string;
  options: Option[];
  title: string;
  tags: string;
  status: string;
  slug: Slug;
  features: PortableTextBlock | PortableTextBlock[];
  body: PortableTextBlock | PortableTextBlock[];
  store: {
    vendor: string;
  };
  productFilters: {
    _key: string;
    name: string;
    value: string;
  }[];
  collection?: Pick<SanityCollectionType['store'], 'title' | 'slug'>;
  subcollection: Pick<
    SanitySubcollectionType,
    'name' | 'slug' | 'parentCollection'
  >;
}

// settings / navigation
export interface SanitySettings {
  seo: Seo;
  _updatedAt: string;
  footer: Footer;
  _createdAt: string;
  _rev: string;
  _type: string;
  _id: string;
  menu: Menu;
  promoBannerContent: PortableTextBlock | PortableTextBlock[];
  promoBannerVisible: boolean;
}

export interface Seo {
  description: string;
  title: string;
}

export interface Footer {
  links?: LinksEntity[] | null;
  text?: TextEntity[] | null;
  customerServiceLinks?: LinksEntity[] | null;
  quickLinks?: LinksEntity[] | null;
}

export interface LinksEntity {
  _key: string;
  title: string;
  url: string;
  reference: Reference;
  _type: string;
}

export interface Reference {
  _type: string;
  _weak: boolean;
  _ref: string;
}

export interface TextEntity {
  markDefs?: null[] | null;
  children?: ChildrenEntity[] | null;
  _type: string;
  style: string;
  _key: string;
}

export interface ChildrenEntity {
  _type: string;
  marks?: null[] | null;
  text: string;
  _key: string;
}

export interface Menu {
  links?: LinksEntity[] | null;
}

export interface SanityBrandType {
  _id: string;
  name: string;
  logo: Image;
  isFeatured: boolean;
}

export interface SanityHomepageSlideType {
  _id: string;
  title: string;
  description: string;
  image: Image;
  imageAlt: string;
  linkText: string;
  linkUrl: string;
}
