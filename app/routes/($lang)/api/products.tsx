import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';
import {ProductConnection} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getVariantsByUserProStatus} from '~/lib/product-variant';

/**
 * Fetch a given set of products from the storefront API
 * @param count
 * @param query
 * @param reverse
 * @param sortKey
 * @returns Product[]
 * @see https://shopify.dev/api/storefront/2023-01/queries/products
 */
export async function loader({request, context}: LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const sortKey = searchParams.get('sortKey') ?? 'BEST_SELLING';
  const query = searchParams.get('query') ?? '';

  let reverse = false;
  try {
    const _reverse = searchParams.get('reverse');
    if (_reverse === 'true') {
      reverse = true;
    }
  } catch (_) {
    // noop
  }

  let count = 4;
  try {
    const _count = searchParams.get('count');
    if (typeof _count === 'string') {
      count = parseInt(_count);
    }
  } catch (_) {
    // noop
  }

  const {products} = await context.storefront.query<{
    products: ProductConnection;
  }>(PRODUCTS_QUERY, {
    variables: {
      count,
      query,
      reverse,
      sortKey,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
    cache: context.storefront.CacheLong(),
  });

  invariant(products, 'No data returned from top products query');

  const filteredProductsWithDiscounts = products.nodes.map((product) => {
    // filter out pro or standard variants based on user pro status
    const filteredVariants = getVariantsByUserProStatus(product, context);

    // update product with filteredVariants
    product.variants.nodes = filteredVariants;
    return product;
  });

  products.nodes = filteredProductsWithDiscounts;

  return json({
    products: flattenConnection(products),
  });
}

export const PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query (
    $query: String
    $count: Int
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// no-op
export default function ProductsApiRoute() {
  return null;
}
