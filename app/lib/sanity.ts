import {ClientConfig, createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

import {
  SanityCollectionType,
  SanityBrandType,
  SanityHomepageSlideType,
  SanityProduct,
  SanitySettings,
  SanitySubcollectionType,
} from './sanity-types';

const sanityConfig: ClientConfig = {
  apiVersion: '2023-05-03',
  dataset: 'production',
  projectId: '957wfnzb',
  useCdn: true,
};

export const sanityClient = createClient(sanityConfig);

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source) {
  return builder.image(source).auto('format');
}

export const getCollections = async (): Promise<SanityCollectionType[]> => {
  const query = '*[_type == "collection"]';
  const params = {};
  const collections = await sanityClient.fetch(query, params);
  return collections;
};

export type SanityCollectionWithSubcollections = SanityCollectionType & {
  subcollections: SanitySubcollectionType[];
};

export const getCollectionsWithSubcollections = async (): Promise<
  SanityCollectionWithSubcollections[]
> => {
  const query =
    '*[_type == "collection"] { ..., "subcollections": subcollections[]-> { ... } }';
  const params = {};
  const collections = await sanityClient.fetch(query, params);
  return collections;
};

export const getCollection = async (
  collectionName,
): Promise<SanityCollectionType> => {
  const query =
    '*[_type == "collection" && store.slug.current == $collectionName]';
  const params = {collectionName};
  const collection = await sanityClient.fetch(query, params);
  return collection[0];
};

export const getSubcollections = async (
  collectionName,
): Promise<SanitySubcollectionType[]> => {
  const query =
    '*[_type == "subcollection" && parentCollection->store.slug.current == $collectionName]';
  const params = {collectionName};
  const subcollections = await sanityClient.fetch(query, params);
  return subcollections;
};

const PRODUCT_QUERY = `{
      ...,
      ...store,
      "filterValues": filterValues,
      "variants": store.variants[]->{
          ...,
          "id": store.id,
          "gid": store.gid,
          "title": store.title,
          "price": store.price,
          "compareAtPrice": store.compareAtPrice,
          "sku": store.sku,
          "prices": [store.price, store.compareAtPrice],
          "image": store.image,
        },
      "collection": {
        "title": collection->store.title,
        "slug": collection->store.slug,
      },
      "subcollection": {
        "name": subcollection->name,
        "slug": subcollection->slug,
        "parentCollection": {
          "title": subcollection->parentCollection->store.title,
          "slug": subcollection->parentCollection->store.slug,
        }
      }
    }`;

export const getProductsBySubcollection = async (
  subcollectionName: string,
  queryContent: string,
) => {
  const query = `*[_type == "product" && store.isDeleted == false && store.status == "active" && subcollection->slug.current == $subcollectionName ${queryContent}] {
      "id": store.id,
      "title": store.title,
      "filterValues": filterValues,
    }`;
  const params = {subcollectionName};
  const products = await sanityClient.fetch(query, params);
  return products as SanitySubcollectionType[];
};

export const getSubcollectionByHandle = async (
  handle: string,
): Promise<{name: string; description?: string}> => {
  const query = `*[_type == "subcollection" && slug.current == $handle] {
    name,
    description,
    image,
  }`;
  const params = {handle};
  const subcollection = await sanityClient.fetch(query, params);
  return subcollection[0];
};

export const getProductBySlug = async (slug): Promise<SanityProduct> => {
  const query = `*[_type == "product" && store.slug.current == $slug] ${PRODUCT_QUERY}`;

  const params = {slug};
  const product = await sanityClient.fetch(query, params);

  if (!product || !product[0]) {
    throw new Error(`Product not found for slug: ${slug}`);
  }

  return product[0];
};

export const getHomepageCollection = async (): Promise<{
  collection: SanityCollectionType;
  // homepageProducts: SanityProduct[];
}> => {
  // get all nested products
  const collectionQuery = `*[_type == "collection" && store.title == "Home page"] {
      ...,
      "products": products[]->{
          ...,
          "id": store.id,
          "gid": store.gid,
          "title": store.title,
          "price": store.price,
          "compareAtPrice": store.compareAtPrice,
          "sku": store.sku,
          "prices": [store.price, store.compareAtPrice],
          "image": store.image,
        },
    }`;
  const params = {};
  const collection = await sanityClient.fetch(collectionQuery, params);

  // const homepageProductsQuery = `*[_type == "product" && collection->store.slug.current == "frontpage"]`;
  // const homepageProducts = await sanityClient.fetch(
  //   homepageProductsQuery,
  //   params,
  // );

  return {collection: collection[0]};
};

export const getSettings = async (): Promise<SanitySettings> => {
  const query = `*[_type == "settings"] {
    ...,
  }`;
  const params = {};
  const settings = await sanityClient.fetch(query, params);
  return settings[0];
};

export const getPageBySlug = async (slug: string): Promise<any> => {
  const query = `*[_type == "page" && slug.current == $slug] {
    ...,
  }`;
  const params = {slug};
  const page = await sanityClient.fetch(query, params);

  if (!page || !page[0]) {
    throw new Error(`Page not found for slug: ${slug}`);
  }

  return page[0];
};

export const getFeaturedBrands = async () => {
  const query = `*[_type == "featuredBrand" && isFeatured == true] {
    _id,
    name,
    logo,
    isFeatured,
  }`;

  const results = await sanityClient.fetch(query);

  return results as SanityBrandType[];
};

export const getBrands = async () => {
  const query = `*[_type == "featuredBrand"] {
    _id,
    name,
    logo,
    isFeatured,
  }`;

  const results = await sanityClient.fetch(query);

  return results as SanityBrandType[];
};

export const getHomepageSlides = async () => {
  const query = `*[_type == "homepageSlides"] {
    _id,
    title,
    description,
    image,
    imageAlt,
    linkText,
    linkUrl
  }`;

  const results = await sanityClient.fetch(query);

  return results as SanityHomepageSlideType[];
};
