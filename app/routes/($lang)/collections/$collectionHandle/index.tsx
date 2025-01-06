import { defer, type LoaderArgs } from '@shopify/remix-oxygen';
import { Await, Link, useLoaderData } from '@remix-run/react';
import type {
  Collection as CollectionType,
  CollectionConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {
  flattenConnection,
  AnalyticsPageType,
  type SeoHandleFunction,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {
  PageHeader,
  Section,
  Text,
  Grid,
  Heading,
  ProductSwimlane,
  IconCaret,
} from '~/components';
import { PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import {
  getCollection,
  getFeaturedBrands,
  getSubcollections,
  urlFor,
} from '~/lib/sanity';
import { SanitySubcollectionType, SanityBrandType } from '~/lib/sanity-types';
import { Benefits } from '~/components/Benefits';
import { FeaturedBrands } from '~/components/FeaturedBrands';
import DiscoverMoreSection from '~/components/DiscoverMoreSection';
import { Suspense } from 'react';
import { BENEFITS } from '~/lib/static-content';
import SubcollectionFallback from '~/assets/subcollection-fallback.png';
import { functionRuntimeWrapper } from '~/lib/utils';

export const SHOP_MORE_SUPPLIES_LINKS = [
  {
    label: 'Adhesives & Sealants',
    to: '/collections/adhesives-and-sealants',
  },
  {
    label: 'Electrical',
    to: '/collections/electrical',
  },
  {
    label: 'Pumps',
    to: '/collections/pumps',
  },
  {
    label: 'Safety & Security',
    to: '/collections/safety-and-security',
  },
  {
    label: 'Tools',
    to: '/collections/tools',
  },
];

const seo: SeoHandleFunction<typeof loader> = ({ data }) => {
  const description =
    data?.collection?.seo?.description ||
    data?.collection?.description ||
    `Check out SquarePeg's collection of ${data?.collection?.title} products.`;

  return {
    title: `${data?.collection?.title} | Square Peg`,
    description: `Check out SquarePeg's collection of ${data?.collection?.title} products.`,
    media: {
      type: 'image',
      url: data?.collection?.image?.url,
      height: data?.collection?.image?.height,
      width: data?.collection?.image?.width,
      altText: data?.collection?.image?.altText,
    },
  };
};

export const handle = {
  seo,
};

const PAGINATION_SIZE = 48;

type VariantFilterParam = Record<string, string | boolean>;
type PriceFiltersQueryParam = Record<'price', { max?: number; min?: number }>;
type VariantOptionFiltersQueryParam = Record<
  'variantOption',
  { name: string; value: string }
>;

export type AppliedFilter = {
  label: string;
  urlParam: {
    key: string;
    value: string;
  };
};

type FiltersQueryParams = Array<
  VariantFilterParam | PriceFiltersQueryParam | VariantOptionFiltersQueryParam
>;

export type SortParam =
  | 'price-low-high'
  | 'price-high-low'
  | 'best-selling'
  | 'newest'
  | 'featured';

export const loader = async ({ params, request, context }: LoaderArgs) => {
  const startTime = Date.now();
  const { collectionHandle } = params;

  invariant(collectionHandle, 'Missing collectionHandle param');

  const searchParams = new URL(request.url).searchParams;
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const { sortKey, reverse } = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const cursor = searchParams.get('cursor');
  const filters: FiltersQueryParams = [];
  const appliedFilters: AppliedFilter[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({ available: value === 'true' });
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({ [key]: value });
      appliedFilters.push({ label: value, urlParam: { key, value } });
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({ variantOption: { name, value: val } });
      appliedFilters.push({ label: val, urlParam: { key, value } });
    }
  }

  // Builds min and max price filter since we can't stack them separately into
  // the filters array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price: { min?: number; max?: number } = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: { key: 'minPrice', value: searchParams.get('minPrice')! },
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: { key: 'maxPrice', value: searchParams.get('maxPrice')! },
      });
    }
    filters.push({
      price,
    });
  }

  const { collection, collections } = await functionRuntimeWrapper(
    context.storefront.query<{
      collection: CollectionType;
      collections: CollectionConnection;
    }>(COLLECTION_QUERY, {
      variables: {
        handle: collectionHandle,
        pageBy: PAGINATION_SIZE,
        cursor,
        filters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }),
    'Collection Loader',
  );

  if (!collection) {
    throw new Response(null, { status: 404 });
  }

  const collectionNodes = flattenConnection(collections);

  const sanityCollection = await functionRuntimeWrapper(
    getCollection(collectionHandle),
    'Sanity Collection Loader',
  );
  const sanitySubcollections = await functionRuntimeWrapper(
    getSubcollections(collectionHandle),
    'Sanity Subcollections Loader',
  );
  const featuredBrands = await functionRuntimeWrapper(
    getFeaturedBrands(),
    'Sanity Featured Brands Loader',
  );

  const sortedSanitySubcollections = sanitySubcollections.sort((a, b) => {
    return ('' + a.name).localeCompare(b.name);
  });

  const popularCollectionProducts = context.storefront.query(
    COLLECTION_POPULAR_PRODUCTS_QUERY,
    {
      variables: {
        handle: collectionHandle,
      },
    },
  );

  const endTime = Date.now();

  console.log(`Collection page load time: ${endTime - startTime}ms`);

  return defer({
    collection,
    appliedFilters,
    sanityCollection,
    sanitySubcollections,
    sortedSanitySubcollections,
    featuredBrands,
    collections: collectionNodes,
    popularCollectionProducts,
    analytics: {
      pageType: AnalyticsPageType.collection,
      collectionHandle,
      resourceId: collection.id,
    },
  });
};

// export const loader = functionRuntimeWrapper(baseLoader, 'Collection Loader');

export default function Collection() {
  const {
    collection,
    collections,
    appliedFilters,
    sanityCollection,
    sanitySubcollections,
    sortedSanitySubcollections,
    popularCollectionProducts,
    featuredBrands,
    ...rest
  } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="bg-neutral-98 pb-24 lg:pb-28 ">
        <div className="content-wrapper pt-6">
          <Breadcrumbs />
        </div>
        <header className="content-wrapper flex flex-col gap-6 my-[72px]">
          <h1 className="text-5xl leading-[56px] font-extrabold">
            {collection.title}
          </h1>
          <div className="flex items-baseline justify-between w-full">
            <Text
              format
              as="p"
              className="inline-block !text-[18px] !leading-7"
            >
              {collection.description || ''}
            </Text>
          </div>
        </header>
        <div className="content-wrapper">
          {/* Should just combine these at some point */}
          {/* Desktop */}
          <Grid layout="collections" className="hidden md:grid !gap-y-12">
            {sortedSanitySubcollections.map((collection) => (
              <SanitySubcollectionCard
                key={collection._id}
                // @ts-ignore
                collection={collection}
              />
            ))}
          </Grid>
          {/* Mobile */}
          <div className="flex flex-col md:hidden divide-y">
            {sortedSanitySubcollections.map((collection) => (
              <Link to={`${collection.slug.current}`} key={collection._id}>
                <div className="flex items-center gap-x-2.5 py-1.5">
                  <img
                    alt={collection.name}
                    src={
                      collection?.image
                        ? urlFor(collection.image).url()
                        : SubcollectionFallback
                    }
                    className="w-12 h-12 rounded-full"
                    height={200}
                    sizes="(max-width: 32em) 100vw, 33vw"
                    width={200}
                  />

                  <Heading
                    className="font-bold text-start flex-1"
                    as="h3"
                    size="copy"
                  >
                    {collection.name}
                  </Heading>
                  <IconCaret direction="left" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="content-wrapper py-28">
        <Benefits orientation="horizontal" content={BENEFITS} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await
          resolve={popularCollectionProducts}
          errorElement="There was a problem fetching popular products"
        >
          {(props) => {
            const products = props?.collection?.products?.nodes;
            return (
              <ProductSwimlane
                title={`Popular ${collection.title} Products`}
                products={products}
              />
            );
          }}
        </Await>
      </Suspense>
      <DiscoverMoreSection
        title="Discover More from SquarePeg"
        body="Join our community to get our latest updates and access our variety of products and services. Our mission is to help you find the best solution for your projects, whether they’re professional or personal."
        links={[
          { label: 'About Us', to: '/our-story' },
          { label: 'Our Resources', to: '/blogs' },
          { label: 'FAQs', to: '/pages/faq-page' },
        ]}
      />
      <FeaturedBrands brands={featuredBrands as SanityBrandType[]} />
    </>
  );
}

export function SanitySubcollectionCard({
  collection,
  loading,
}: {
  collection: SanitySubcollectionType;
  loading?: HTMLImageElement['loading'];
}) {
  return (
    <Link to={`${collection.slug.current}`} className="grid gap-4">
      <div className="flex flex-col items-center">
        <img
          alt={collection.name}
          src={
            collection?.image
              ? urlFor(collection.image).url()
              : SubcollectionFallback
          }
          className="w-40 h-40 rounded-full"
          height={400}
          sizes="(max-width: 32em) 100vw, 33vw"
          width={600}
          loading={loading}
        />

        <Heading className="mt-4 font-semibold text-center" as="h3" size="copy">
          {collection.name}
        </Heading>
      </div>
    </Link>
  );
}

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $pageBy,
        after: $cursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

const COLLECTION_POPULAR_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query COLLECTION_POPULAR_PRODUCTS_QUERY($handle: String) {
    collection(handle: $handle) {
      id
      products(first: 100) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;

function getSortValuesFromParam(sortParam: SortParam | null) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
