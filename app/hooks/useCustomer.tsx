import {useMatches} from '@remix-run/react';
import {Customer} from '@shopify/hydrogen/storefront-api-types';

export const useCustomer = () => {
  const [root] = useMatches();
  return root.data?.customer as Customer | null;
};
