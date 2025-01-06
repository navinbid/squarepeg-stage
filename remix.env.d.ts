/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

// import type {Storefront} from '@shopify/hydrogen';
import type { Storefront } from '~/lib/type';
import type {HydrogenSession} from '~/lib/session.server';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    PRO_BENEFITS_SENDER_NAME: any;
    PRO_BENEFITS_SENDER_EMAIL: any;
    SENDGRID_API_KEY: any;
    PRO_BENEFITS_EMAIL: any;
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STOREFRONT_API_VERSION: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    SWYM_API_ENDPOINT: string;
    SWYM_API_KEY: string;
    SWYM_PID: string;
    KLAVIYO_API_KEY: string;
    KLAVIYO_API_REVISION: string;
    KLAVIYO_LIST_ID: string;
    KLAVIYO_PUBLIC_KEY: string;
    KLAVIYO_SIGNUP_LIST_ID: string;
    PRIVATE_SHOPIFY_STORE_MULTIPASS_SECRET: string;
    PRIVATE_SHOPIFY_CHECKOUT_DOMAIN?: string;
    INFOR_CONNECTION_STRING?: string;
  }
}

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    waitUntil: ExecutionContext['waitUntil'];
    session: HydrogenSession;
    storefront: Storefront;
    cache: Cache;
    env: Env;
  }
}

// Needed to make this file a module.
export {};
