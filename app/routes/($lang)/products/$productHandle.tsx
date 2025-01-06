import {
  OKENDO_PRODUCT_STAR_RATING_FRAGMENT,
  OKENDO_PRODUCT_REVIEWS_FRAGMENT,
} from '@okendo/shopify-hydrogen';
import { redirect, type LoaderArgs, AppLoadContext } from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import type {
  SelectedOptionInput,
  Customer,
} from '@shopify/hydrogen/storefront-api-types';
import { MEDIA_FRAGMENT, METAFIELD_QUERY } from '~/data/fragments';
import type { Product } from 'schema-dts';
import { getProductBySlug } from '~/lib/sanity';

export async function loader({ params, request, context }: LoaderArgs) {
  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const url = new URL(request.url);

  // Avoid redirection if the request comes from the cart page or any other invalid referrer
  const referrer = request.headers.get('Referer');
  if (referrer && referrer.includes('/cart')) {
    return null; // Skip redirection for cart requests
  }

  // Ensure this is a direct request for the product
  if (!url.pathname.startsWith(`/products/${productHandle}`)) {
    return null;
  }

  const selectedOptions: SelectedOptionInput[] = [];
  url.searchParams.forEach((value, name) => {
    selectedOptions.push({ name, value });
  });

  const { product } = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  const sanityProduct = await getProductBySlug(productHandle);

  return redirect(
    `/${sanityProduct.subcollection.parentCollection.slug.current}/${productHandle}`,
  );
}

export default function Product() {
  return null;
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    quantityAvailable
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;
const PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${OKENDO_PRODUCT_STAR_RATING_FRAGMENT}
	${OKENDO_PRODUCT_REVIEWS_FRAGMENT}
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      totalInventory
      ${METAFIELD_QUERY}
      ...OkendoStarRatingSnippet
			...OkendoReviewsSnippet
      options {
        name
        values
      }
      tags
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      media(first: 10) {
        nodes {
          ...Media
        }
      }
      variants(first: 4) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
`;

export const CUSTOMER_QUERY = `#graphql
query CustomerDetails($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id
  }
}
`;

export async function getCustomer(
  context: AppLoadContext,
  customerAccessToken: string,
) {
  const { storefront } = context;

  const data = await storefront.query<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    variables: {
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return data.customer;
}
