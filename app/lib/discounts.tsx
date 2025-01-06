import {Storefront} from '@shopify/hydrogen';
import {adminGraphQLClient} from './shopify-admin.server';

export async function validateDiscountCode(code: string) {
  console.log({code});
  // use shopify graphql API to validate discount code
  const discountCode: any = await adminGraphQLClient.request(
    DISCOUNT_CODE_QUERY,
    {
      code,
    },
  );

  if (!discountCode?.codeDiscountNodeByCode) {
    return false;
  }

  return true;
}

const DISCOUNT_CODE_QUERY = `#graphql
  query DiscountCode($code: String!) {
    codeDiscountNodeByCode(code: $code) {
      id
    }
  }
`;
