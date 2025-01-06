import { Suspense, useEffect, useState } from 'react';
import { defer, type LoaderArgs } from '@shopify/remix-oxygen';
import {
  flattenConnection,
  getPaginationVariables,
  Pagination,
} from '@shopify/hydrogen';
import { Await, useLoaderData, useSearchParams } from '@remix-run/react';
import type {
  CollectionConnection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import { Text, Grid, ProductCard, Button } from '~/components';
import { PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { getImageLoadingPriority, PAGINATION_SIZE } from '~/lib/const';
import { sanityClient } from '~/lib/sanity';
import { FilterSection } from '~/components/FilterSection';
import { FilterChips } from '~/components/FilterChips';
import {
  FilterDropdown,
  FilterOption,
  SORT_OPTIONS,
} from '~/components/FilterDropdown';
import { FilterModal } from '~/components/FilterModal';
import { appendDiscountsToProducts } from '~/lib/shopify-admin.server';
import { getVariantsByUserProStatus } from '~/lib/product-variant';
import { functionRuntimeWrapper } from '~/lib/utils';
import {
  LoadingSkeleton,
  ProductCardSkeleton,
} from '~/components/LoadingSkeleton';

export const handle = {
  seo: {
    title: 'Search HVAC, Plumbing, & Home Renovation Supplies | Square Peg',
  },
};

export default function SearchPage({
  collectionName,
}: {
  collectionName?: string;
}) {
  const { searchResults } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const initialSort = searchParams.get('sort')
    ? SORT_OPTIONS.find((sort) => sort.value === searchParams.get('sort'))
    : SORT_OPTIONS[0];

  const [sort, setSort] = useState(initialSort);
  const [resultCount, setResultCount] = useState(0);

  function updateSort(filter: FilterOption) {
    setSort(filter);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', filter.value);
    setSearchParams(newSearchParams);
  }

  return (
    <div className="content-wrapper">
      <div className="lg:flex lg:gap-16 py-6 md:py-8 lg:py-12">
        <aside className="w-[272px] hidden lg:block">
          <Suspense
            fallback={<LoadingSkeleton className="!w-full mb-2" height={60} />}
          >
            <Await resolve={searchResults}>
              {(awaitedData) => {
                const { filterList, products, sanityResults } = awaitedData;
                const noResults =
                  products?.nodes?.length === 0 || sanityResults?.length === 0;
                return (
                  <FilterSection
                    filters={noResults ? [] : filterList}
                    collectionName={collectionName}
                  />
                );
              }}
            </Await>
          </Suspense>
        </aside>
        <div className="flex lg:hidden">
          <Suspense>
            <Await resolve={searchResults}>
              {(awaitedData) => {
                const { filterList, products, sanityResults } = awaitedData;
                // console.log({products, sanityResults});

                return (
                  <FilterModal
                    isOpen={filterModalOpen}
                    setIsOpen={setFilterModalOpen}
                    collectionName={collectionName}
                    filterList={filterList}
                  />
                );
              }}
            </Await>
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="w-full">
              <LoadingSkeleton className="mb-8" width="100%" height={100} />
              <ProductCardSkeleton count={3} />
            </div>
          }
        >
          <Await resolve={searchResults}>
            {(awaitedData) => {
              const { products, filterList, sanityResults } = awaitedData;

              const noResults =
                products?.nodes?.length === 0 || sanityResults?.length === 0;

              return (
                <div className="flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <Text className="py-4 text-[#160E1B]">
                        {`${noResults ? 0 : resultCount} of ${sanityResults.length
                          } items`}
                      </Text>
                      <FilterDropdown
                        value={sort}
                        onChange={updateSort}
                        options={SORT_OPTIONS}
                      />
                    </div>
                    <FilterChips filters={filterList} />
                  </div>
                  {noResults ? (
                    <Text className="opacity-50">
                      No results, try something else.
                    </Text>
                  ) : (
                    <Pagination
                      // @ts-ignore
                      connection={products}
                    >
                      {({ nodes, isLoading, NextLink, PreviousLink }) => {
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        useEffect(() => {
                          if (resultCount !== nodes.length) {
                            setResultCount(nodes.length);
                          }
                        }, [nodes]);
                        const itemsMarkup = nodes.map((product, i) => (
                          <ProductCard
                            // @ts-ignore
                            key={product.id}
                            // @ts-ignore
                            product={product}
                            loading={getImageLoadingPriority(i)}
                            quickAdd
                          />
                        ));
                        const [loadMoreClicked, setLoadMoreClicked] = useState(false)

                        function handleLoadMore() {
                          setLoadMoreClicked(true);

                          setTimeout(() => {
                            setLoadMoreClicked(false);
                          }, 2000);
                        }

                        return (
                          <>
                            <Grid layout="products">{itemsMarkup}</Grid>
                            <div className="flex items-center justify-center mt-6">
                              <NextLink>
                                <Button variant="secondary" width="full" onClick={handleLoadMore}>
                                  {isLoading && loadMoreClicked ? 'Loading...' : 'Load More'}
                                </Button>
                              </NextLink>
                            </div>
                          </>
                        );
                      }}
                    </Pagination>
                  )}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export function buildSanityQueryFromSearchParams(
  searchParams: URLSearchParams,
) {
  const searchTerm = searchParams.get('q')!;

  // parse search params into an object with keys and values
  const params = Object.fromEntries(searchParams.entries());

  const { vendor, q, sort, cursor, direction, ...filters } = params;

  const filterQuery = Object.entries(filters)
    .map(([key, value]) => {
      return `("${key}" in filterValues[].name && "${value}" in filterValues[].value)`;
    })
    .join(' && ');

  const queries = [];

  if (searchTerm) {
    queries.push(
      `(store.title match "*${searchTerm}*" || store.vendor match "*${searchTerm}*" || subcollection->name match "*${searchTerm}*" || store.slug.current match "*${searchTerm}*")`,
    );
  }

  if (Object.entries(filters).length > 0) {
    queries.push(`defined(filterValues)`);
    queries.push(filterQuery);
  }

  if (vendor) {
    queries.push(`store.vendor match "*${vendor}*"`);
  }

  const queryString = queries.join(' && ');
  const queryContent = queries.length > 0 ? `&& ${queryString}` : '';

  return queryContent;
}

export function buildFilterListFromProducts(products: any) {
  const filterList = products.reduce((acc, curr) => {
    const { filterValues } = curr;
    if (!filterValues) return acc;
    filterValues.forEach((filter) => {
      const { name, value } = filter;
      if (!acc[name]) {
        acc[name] = [];
      }
      if (!acc[name].includes(value) && value !== '' && value !== undefined) {
        acc[name].push(value);
      }
    });
    return acc;
  }, {});

  filterList.vendor = products.reduce((acc, curr) => {
    const { vendor } = curr;
    if (!vendor) return acc;
    if (!acc.includes(vendor) && vendor !== '' && vendor !== undefined) {
      acc.push(vendor);
    }
    return acc;
  }, []);

  return filterList;
}

export async function loader({ request, context }: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q')!;
  const params = Object.fromEntries(searchParams.entries());
  const { sort, q } = params;

  const queryContent = buildSanityQueryFromSearchParams(searchParams);

  async function getSearchResults() {
    const startTime = Date.now();
    const sanityResults = await functionRuntimeWrapper(
      sanityClient.fetch(
        `*[_type == "product" && store.status == "active" && store.isDeleted == false ${queryContent}] {
            "title": store.title,
            "id": store.id,
            "filterValues": filterValues,
          }`,
      ),
      'sanityClient.fetch',
    );

    const sortKey = sort?.includes('REVERSE') ? sort.split('_')[0] : sort;
    const paginationVariables = getPaginationVariables(request, {
      pageBy: PAGINATION_SIZE,
    });
    const variables = {
      ...paginationVariables,
      searchTerm,
      reverse: sort?.includes('REVERSE'),
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
      // @ts-ignore
      query: sanityResults.map((product) => `id:${product.id}`).join(' OR '),
      sortKey: sortKey || 'RELEVANCE',
    };

    const data = await functionRuntimeWrapper(
      context.storefront.query<{
        products: ProductConnection;
      }>(SEARCH_QUERY, {
        variables,
      }),
      'context.storefront.query',
    );

    invariant(data, 'No data returned from Shopify API');
    const { products } = data;

    const getRecommendations = !searchTerm || products?.nodes?.length === 0;
    const filterList = buildFilterListFromProducts(sanityResults);

    const productsWithDiscounts = await appendDiscountsToProducts(
      products.nodes,
    );
    products.nodes = productsWithDiscounts;
    const filteredProducts = products.nodes.map((product) => {
      // filter out pro or standard variants based on user pro status
      const filteredVariants = getVariantsByUserProStatus(product, context);

      // update product with filteredVariants
      product.variants.nodes = filteredVariants;
      return product;
    });
    products.nodes = filteredProducts;

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(
      `Search took ${duration}ms with ${sanityResults.length} results`,
    );

    return {
      sanityResults,
      filterList,
      products,
      getRecommendations,
    };
  }

  return defer({
    searchTerm,
    searchResults: getSearchResults(),
    // noResultRecommendations: getRecommendations
    //   ? getNoResultRecommendations(context.storefront)
    //   : Promise.resolve(null),
  });
}

export const SEARCH_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query search(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

export async function getNoResultRecommendations(
  storefront: LoaderArgs['context']['storefront'],
) {
  const data = await storefront.query<{
    featuredCollections: CollectionConnection;
    featuredProducts: ProductConnection;
  }>(SEARCH_NO_RESULTS_QUERY, {
    variables: {
      pageBy: PAGINATION_SIZE,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    featuredCollections: flattenConnection(data.featuredCollections),
    featuredProducts: flattenConnection(data.featuredProducts),
  };
}

const SEARCH_NO_RESULTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query searchNoResult(
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
  ) @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
    featuredProducts: products(first: $pageBy) {
      nodes {
        ...ProductCard
      }
    }
  }
`;
