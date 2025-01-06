import {
  Collection,
  CountryCode,
  LanguageCode,
  Product,
} from '@shopify/hydrogen/storefront-api-types';
import {LoaderArgs, json} from '@shopify/remix-oxygen';

export type LoaderData = {
  predictiveSearch: {
    products: Product[];
    collections: Collection[];
  };
};

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;

  const query = searchParams.get('q')!;

  const results = await storefront.query<LoaderData>(PREDICTIVE_SEARCH_QUERY, {
    variables: {
      query,
      country: storefront.i18n.country as CountryCode,
      language: storefront.i18n.language as LanguageCode,
    },
  });

  return json(results.predictiveSearch);
}

const PREDICTIVE_SEARCH_QUERY = `#graphql
  query predictiveSearch(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: 10,
      query: $query,
      types: [PRODUCT, COLLECTION],
      searchableFields: [AUTHOR, BODY, PRODUCT_TYPE, TAG, TITLE, VARIANTS_BARCODE, VARIANTS_SKU, VARIANTS_TITLE, VENDOR]
    ) {
      products {
        id
        title
        handle
        featuredImage {
          id
          url
        }
      }
      collections {
        id
        title
        handle
      }
    }
  }
`;
