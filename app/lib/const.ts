export const PAGINATION_SIZE = 24;
export const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;
export const ATTR_LOADING_EAGER = 'eager' as const;

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
) {
  return index < maxEagerLoadCount ? ATTR_LOADING_EAGER : undefined;
}

export const PUBLIC_ACCOUNT_ROUTES = [
  'recover',
  'login',
  'register',
  'activate',
  'reset',
];
export const PUBLIC_ACCOUNTS_ROUTES_REGEX = new RegExp(
  `^\/account\/(${PUBLIC_ACCOUNT_ROUTES.join('|')})`,
);

export const ORDERS_SHOWN_ON_ACCOUNT = 5;
export const ORDER_PAGE_SIZE = 10;
export const KLAVIYO_API_BASE = 'https://a.klaviyo.com';

export const PRO_CUSTOMER_META_VALUE = '1';
export const PRO_VARIANT_TITLE = 'Pro';
export const PRO_SESSION_MEMBERSHIP_KEY = 'membership';
export const PRO_SESSION_MEMBERSHIP_VALUE = 'pro';
