import { type ReactNode, useEffect } from 'react';
import {
  WithOkendoStarRatingSnippet,
  WithOkendoReviewsSnippet,
  OKENDO_PRODUCT_STAR_RATING_FRAGMENT,
  OKENDO_PRODUCT_REVIEWS_FRAGMENT,
} from '@okendo/shopify-hydrogen';
import {
  defer,
  type LoaderArgs,
  AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  AnalyticsPageType,
  ShopifyAnalyticsProduct,
  flattenConnection,
  type SeoHandleFunction,
  type SeoConfig,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import type {
  ProductVariant,
  SelectedOptionInput,
  Product as ProductType,
  Shop,
  ProductConnection,
  MediaConnection,
  MediaImage,
  Customer,
} from '@shopify/hydrogen/storefront-api-types';
import {
  MEDIA_FRAGMENT,
  METAFIELD_QUERY,
  PRODUCT_CARD_FRAGMENT,
} from '~/data/fragments';
import type { Storefront } from '~/lib/type';
import type { Product } from 'schema-dts';
import { getProductBySlug } from '~/lib/sanity';
import { findDiscountForProduct } from '~/lib/shopify-admin.server';
import { getVariantsByUserProStatus } from '~/lib/product-variant';

const seo: SeoHandleFunction<typeof loader> = ({ data }) => {
  // @ts-ignore
  const media = flattenConnection<MediaConnection>(data.product.media).find(
    (media) => media.mediaContentType === 'IMAGE',
  ) as MediaImage | undefined;

  const collectionName = data?.sanityProduct?.subcollection?.parentCollection?.title;

  const description =
    data?.product?.seo?.description ||
    data?.product?.seo?.title ||
    data?.product?.title;

  return {
    title: data?.product?.title,
    media: media?.image,

    // description: data?.product?.description,
    description: `Buy ${data?.product?.title} and other ${collectionName} supplies at SquarePeg.`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: data?.product?.vendor,
      name: data?.product?.title,
    },
  } satisfies SeoConfig<Product>;
};

export const handle = {
  seo,
};

export async function loader({ params, request, context }: LoaderArgs) {

  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');


  let searchParams;

  if (searchParams) {

    useEffect(() => {
      searchParams = new URL(request.url).searchParams;
    }, [])

  } else {

    searchParams = new URL(request.url).searchParams;

  }



  const selectedOptions: SelectedOptionInput[] = [];

  searchParams.forEach((value, name) => {
    selectedOptions.push({ name, value });
  });

  const { shop, product } = await context.storefront.query<{
    product: ProductType & {
      selectedVariant?: ProductVariant;
    } & WithOkendoStarRatingSnippet &
    WithOkendoReviewsSnippet;
    shop: Shop;
  }>(PRODUCT_QUERY, {
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

  const recommended = getRecommendedProducts(context.storefront, product?.id);

  // filter out pro or standard variants based on user pro status
  const filteredVariants = getVariantsByUserProStatus(product, context);


  // update product with filteredVariants
  product.variants.nodes = filteredVariants;

  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product?.id,
    variantGid: selectedVariant?.id,
    name: product?.title,
    variantName: selectedVariant?.title,
    brand: product?.vendor,
    price: selectedVariant?.price?.amount,
  };

  const sanityProduct = await getProductBySlug(productHandle);

  const productDiscount = await findDiscountForProduct(product?.id);

  const customerAccessToken = await context.session.get('customerAccessToken');
  let data;
  if (!customerAccessToken) {
    data = '';
  } else {
    const customer = await getCustomer(context, customerAccessToken);


    const idarr = customer.id.split('Customer/');

    const myHeaders = new Headers();
    myHeaders.append(
      'X-Shopify-Access-Token',
      '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',
    );
    myHeaders.append('Content-Type', 'application/json');

    const response = await fetch(
      'https://ecom-newbrand-dev.myshopify.com/admin/api/2022-07/customers/' +
      idarr[1] +
      '/metafields.json',
      {
        headers: myHeaders,
      },
    );

    data = await response.json();
  }
  const pid = product?.id.split('Product/')

  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');

  const productMfields = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/products/${pid[1]}/metafields.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.json())
    .then((result) => {
      return result;
    });

  return defer({
    sanityProduct,
    productDiscount,
    filteredVariants,
    productMfields,
    product,
    shop,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product?.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    data,
    searchParams,
  });
}

export const DiscountDetails = ({
  minimumQuantity,
  standardPrice,
  discountAmount,
}: {
  minimumQuantity: number;
  standardPrice: number;
  discountAmount: Awaited<ReturnType<typeof findDiscountForProduct>>;
}) => {
  const discountedPrice = discountAmount?.flatDiscount
    ? standardPrice - discountAmount?.flatDiscount
    : (Number(standardPrice) * (1 - discountAmount?.amount)).toFixed(2);

  // console.log({ discountAmount });
  return (
    <div className="bg-lime-90 text-success py-[6px] px-2 text-xs rounded h-12 md:h-auto">
      Buy <span className="font-bold">{minimumQuantity} or more</span> for{' '}
      <span className="font-bold">${discountedPrice}/each</span>
    </div>
  );
};

export const quantityButtonStyles = 'p-4 text-neutral-8 border rounded-full border-neutral-8 disabled:opacity-50 disabled:cursor-not-allowed';

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

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<{
    recommended: ProductType[];
    additional: ProductConnection;
  }>(RECOMMENDED_PRODUCTS_QUERY, {
    variables: { productId, count: 12 },
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}

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