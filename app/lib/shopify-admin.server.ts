import {
  Product,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {LoaderArgs} from '@shopify/remix-oxygen';
import {GraphQLClient} from 'graphql-request';
import {HOMEPAGE_FEATURED_PRODUCTS_QUERY} from '~/routes/($lang)';
import {getVariantsByUserProStatus} from './product-variant';

export const adminGraphQLClient = new GraphQLClient(
  `https://ecom-newbrand.myshopify.com/admin/api/2023-10/graphql.json`,
  {
    headers: {
      'X-Shopify-Access-Token': `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`,
    },
    fetch,
  },
);

const GET_ALL_DISCOUNTS = `#graphql
  {
    automaticDiscountNodes(first: 50, query: "status:ACTIVE") {
      nodes {
        automaticDiscount {
          ... on DiscountAutomaticBasic {
            status
            __typename
            minimumRequirement {
              ... on DiscountMinimumQuantity {
                greaterThanOrEqualToQuantity
              }
            }

            customerGets {
              items {
                ... on DiscountProducts {
                  products(first: 10) {
                    nodes {
                      id
                    }
                  }
                }
              }
              value {
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                  }
                }
              }
            }
            title
          }
        }
      }
    }
  }
`;

export const getAllDiscounts = async () => {
  const response = await adminGraphQLClient.request(GET_ALL_DISCOUNTS);

  return response;
};

export const findDiscountForProduct = async (productId: string) => {
  const allDiscounts = await adminGraphQLClient.request(GET_ALL_DISCOUNTS);

  // @ts-ignore
  const discount = allDiscounts?.automaticDiscountNodes?.nodes.find(
    (discount) => {
      const discountForProduct =
        discount.automaticDiscount?.customerGets?.items?.products?.nodes.find(
          (product) => product.id === productId,
        );

      return discountForProduct;
    },
  );

  if (!discount) {
    return null;
  }

  const discountValue = discount?.automaticDiscount?.customerGets?.value;

  const discountDetails = {
    amount: discountValue?.percentage,
    flatDiscount: discountValue?.amount?.amount,
    minimumQuantity:
      discount?.automaticDiscount?.minimumRequirement
        ?.greaterThanOrEqualToQuantity,
  };

  return discountDetails;
};

export const appendDiscountsToProducts = async (products: Product[]) => {
  const allDiscounts = await adminGraphQLClient.request(GET_ALL_DISCOUNTS);

  const productsWithDiscounts = products.map((product) => {
    // @ts-ignore
    const discount = allDiscounts?.automaticDiscountNodes?.nodes.find(
      (discount) => {
        const discountForProduct =
          discount.automaticDiscount?.customerGets?.items?.products?.nodes.find(
            (discountedProduct) => discountedProduct.id === product.id,
          );

        return discountForProduct;
      },
    );

    const discountValue = discount?.automaticDiscount?.customerGets?.value;

    const discountDetails = discount
      ? {
          amount: discountValue?.percentage,
          flatDiscount: discountValue?.amount?.amount,
          minimumQuantity:
            discount?.automaticDiscount?.minimumRequirement
              ?.greaterThanOrEqualToQuantity,
        }
      : null;

    return {
      ...product,
      discountDetails,
    };
  });

  return productsWithDiscounts;
};

export const getFeaturedProductsWithDiscounts = async (
  context: LoaderArgs['context'],
) => {
  const featuredProducts = await context.storefront.query<{
    products: ProductConnection;
  }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY);

  const featuredProductsWithDiscounts = await appendDiscountsToProducts(
    featuredProducts.products.nodes,
  );

  const filteredProductsWithDiscounts = featuredProductsWithDiscounts.map(
    (product) => {
      // filter out pro or standard variants based on user pro status
      const filteredVariants = getVariantsByUserProStatus(product, context);

      // update product with filteredVariants
      product.variants.nodes = filteredVariants;
      return product;
    },
  );

  return filteredProductsWithDiscounts;
};
