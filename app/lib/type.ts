import type {LoaderArgs} from '@shopify/remix-oxygen';
import {Storefront as HydrogenStorefront} from '@shopify/hydrogen';
import {
  CountryCode,
  CurrencyCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';

export type Locale = {
  language: LanguageCode;
  country: CountryCode;
  label: string;
  currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};

export type Storefront = HydrogenStorefront<I18nLocale>;
export type StorefrontContext = {
  storefront: Storefront;
};
export type StorefrontLoaderArgs = {
  context: StorefrontContext;
};

export enum CartAction {
  ADD_TO_CART = 'LinesAdd',
  REMOVE_FROM_CART = 'LinesRemove',
  UPDATE_CART = 'LinesUpdate',
  UPDATE_DISCOUNT = 'DiscountCodesUpdate',
  UPDATE_BUYER_IDENTITY = 'BuyerIdentityUpdate',
}
export type CartActions = keyof typeof CartAction;
