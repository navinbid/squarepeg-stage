import { useEffect } from 'react';
import {
  defer,
  type LinksFunction,
  type MetaFunction,
  type LoaderArgs,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useMatches,
} from '@remix-run/react';
import {
  ShopifySalesChannel,
  Seo,
  type SeoHandleFunction,
  flattenConnection,
} from '@shopify/hydrogen';
import { ExternalScripts } from 'remix-utils';

import { OkendoProvider, getOkendoProviderData } from '@okendo/shopify-hydrogen';
import { Layout } from '~/components';
import { GenericError } from './components/GenericError';
import { NotFound } from './components/NotFound';

import styles from './styles/app.css';
import favicon from '../public/favicon.svg';

import { DEFAULT_LOCALE, parseMenu, type EnhancedMenu } from './lib/utils';
import invariant from 'tiny-invariant';
import { Shop, Cart } from '@shopify/hydrogen/storefront-api-types';
import { useAnalytics } from './hooks/useAnalytics';
import type { StorefrontContext } from './lib/type';
import { getCustomer } from './routes/($lang)/account';
import {
  SanityCollectionWithSubcollections,
  getCollectionsWithSubcollections,
  getSettings,
} from './lib/sanity';
import lightboxStyles from 'yet-another-react-lightbox/styles.css';
import lightboxThumbnailStyles from 'yet-another-react-lightbox/plugins/thumbnails.css';
import { getSwymCredentials } from './routes/($lang)/api/swym';
import {
  PRO_CUSTOMER_META_VALUE,
  PRO_SESSION_MEMBERSHIP_KEY,
  PRO_SESSION_MEMBERSHIP_VALUE,
  PRO_VARIANT_TITLE,
} from './lib/const';
import { getOrCreateFavoritesList } from './lib/swym';
import GTMContainerScript from './components/GTMContainerScript';

const OKENDO_SUBSCRIBER_ID = 'cba607ed-0f15-487a-b328-45eb5169fed8';

const seo: SeoHandleFunction<typeof loader> = ({ data, pathname }) => ({
  // title: data?.layout?.shop?.name,
  title: 'SquarePeg',
  titleTemplate: '%s',
  description: data?.layout?.shop?.description,
  // handle: '@shopify',
  url: `https://squarepegsupply.com${pathname}`,
});

export const handle = {
  seo,
  scripts: () => [
    {
      src: 'https://app.termly.io/resource-blocker/b8ba18fb-7df3-4494-9b23-e6ba6da0b1e2?autoBlock=off',
    },
  ],
};

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: lightboxStyles as string },
    { rel: 'stylesheet', href: lightboxThumbnailStyles as string },
    { rel: 'stylesheet', href: styles },
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    { rel: 'icon', type: 'image/svg+xml', href: favicon },
  ];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
  'oke:subscriber_id': OKENDO_SUBSCRIBER_ID,
});

export async function loader({ context }: LoaderArgs) {
  try {
    const { cart } = context;
    const customerAccessToken = await context.session.get(
      'customerAccessToken',
    );
    const [
      cartId,
      promoBannerDismissed,
      membership,
      layout,
      sanitySettings,
      collections,
      collectionsOrder,
    ] = await Promise.all([
      context.session.get('cartId'),
      context.session.get('promoBannerDismissed'),
      context.session.get(PRO_SESSION_MEMBERSHIP_KEY),
      getLayoutData(context),
      getSettings(),
      getCollectionsWithSubcollections(),
      getCollectionsOrder(context),
    ]);

    const customer = customerAccessToken
      ? await getCustomer(context, customerAccessToken)
      : null;

    const existingSwymRegId = context.session.get('swymRegId');
    // const existingListId = context.session.get('swymListId');
    const existingListId = false;

    let swymList = null;

    if ((!existingSwymRegId || !existingListId) && Boolean(customer?.email)) {
      const swymCredentials = await getSwymCredentials(
        {
          swymApiKey: context.env.SWYM_API_KEY,
          swymPid: context.env.SWYM_PID,
          swymApiEndpoint: context.env.SWYM_API_ENDPOINT,
        },
        customer?.email ?? '',
      );

      const list = await getOrCreateFavoritesList({
        swymApiEndpoint: context.env.SWYM_API_ENDPOINT,
        swymPID: context.env.SWYM_PID,
        regId: swymCredentials.regid,
        sessionId: swymCredentials.sessionid,
      });

      if (list) {
        context.session.set('swymListId', list.lid);
        swymList = list;
      }

      context.session.set('swymRegId', swymCredentials.regid);
      context.session.set('swymSessionId', swymCredentials.sessionid);
    }

    // used for deferred response cookies

    // doing this here because membership could change from the client, logging in/out, creating account

    const customerHasProTag = customer?.tags?.includes('pro');

    // if customer is a pro member
    // @ts-ignore
    if (
      customer?.proStatus?.value === PRO_CUSTOMER_META_VALUE ||
      customerHasProTag
    ) {
      // if session is not set for a pro member, set it, otherwise quietly exit
      if (membership !== PRO_SESSION_MEMBERSHIP_VALUE) {
        context.session.set(
          PRO_SESSION_MEMBERSHIP_KEY,
          PRO_SESSION_MEMBERSHIP_VALUE,
        );
        // deferOptions = {
        //   status: 200,
        //   headers: {
        //     'Set-Cookie': await context.session.commit(),
        //   },
        // };
      }
    } else if (membership) {
      // if membership session is set for a standard member, or logged out user, unset it
      context.session.unset(PRO_SESSION_MEMBERSHIP_KEY);
      // deferOptions = {
      //   status: 200,
      //   headers: {
      //     'Set-Cookie': await context.session.commit(),
      //   },
      // };
    }

    // create lookup for collection indexes
    const collectionsOrderMap = new Map(
      collectionsOrder.nodes.map((c) => [c.id, c.metafields[0]?.value]),
    );

    // add indexes to collections
    collections.forEach((c) => {
      const storeId = c.store.gid;
      if (collectionsOrderMap.has(storeId)) {
        c.store.index =
          Number(collectionsOrderMap.get(storeId)) || Number.MAX_SAFE_INTEGER;
      }
    });

    // validate cart items by user membership
    // @ts-ignore
    const cartData = await cart.get();
    const flatCartLines = flattenConnection(cartData?.lines || {});

    const linesToRemove = flatCartLines.filter((line) => {
      // if user is pro, remove any non-pro items from cart
      if (
        context.session.get(PRO_SESSION_MEMBERSHIP_KEY) ===
        PRO_SESSION_MEMBERSHIP_VALUE
      ) {
        // @ts-ignore
        return !line.merchandise.title.includes(PRO_VARIANT_TITLE);
      } else {
        // filter item if it is a pro item for a standard member/logged out user
        // @ts-ignore
        return line.merchandise.title.includes(PRO_VARIANT_TITLE);
      }
    });
    // @ts-ignore
    const lineIds = linesToRemove.map((l) => l.id);
    if (lineIds.length > 0) {
      // @ts-ignore
      await cart.removeLines(lineIds);
    }

    return defer(
      {
        layout,
        customer,
        sanitySettings,
        swymList,
        selectedLocale: context.storefront.i18n,
        collections,
        // @ts-ignore
        cart: cart.get(),
        analytics: {
          shopifySalesChannel: ShopifySalesChannel.hydrogen,
          shopId: layout.shop.id,
        },
        okendoProviderData: await getOkendoProviderData({
          context,
          subscriberId: OKENDO_SUBSCRIBER_ID,
        }),
        promoBannerDismissed,
      },
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
        },
      },
    );
  } catch (error) {
    console.error(error);
    return error;
  }
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://config.gorgias.chat/gorgias-chat-bundle-loader.js?applicationId=29040';
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // @ts-ignore
  useAnalytics(hasUserConsent, locale);

  return (
    <html lang={locale.language}>
      <head>
        <GTMContainerScript />

        <meta
          name="google-site-verification"
          content="eSxvtnSpa-UAkckgexJUf_fgpApl6mI2gJJ0xZQSAXM"
        />

        <Seo />
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <noscript>
          <iframe
            title="Google Tag Manager"
            src="https://www.googletagmanager.com/ns.html?id=GTM-KN6RB2JB"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <OkendoProvider okendoProviderData={data.okendoProviderData} />
        <Layout
          layout={data.layout as LayoutData}
          // @ts-ignore
          settings={data.sanitySettings}
          key={`${locale.language}-${locale.country}`}
          // @ts-ignore
          collections={data.collections as SanityCollectionWithSubcollections[]}
        >
          <Outlet />
        </Layout>
        <ScrollRestoration />
        {process.env.NODE_ENV !== 'development' && (
          <script src="/accessibe.js" type="text/javascript" />
        )}
        <Scripts />
        <ExternalScripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const [root] = useMatches();
  const caught = useCatch();
  const isNotFound = caught.status === 404;
  const locale = root.data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale.language}>
      <head>
        <title>{isNotFound ? 'Not found' : 'Error'}</title>
        <Meta />
        <Links />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Layout
          settings={root?.data?.sanitySettings}
          layout={root?.data?.layout}
          key={`${locale.language}-${locale.country}`}
          collections={root?.data?.collections}
        >
          {isNotFound ? (
            <NotFound />
          ) : (
            <GenericError
              error={{ message: `${caught.status} ${caught.data}` }}
            />
          )}
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  const [root] = useMatches();
  const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale.language}>
      <head>
        <title>Error</title>
        <Meta />
        <Links />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Layout
          layout={root?.data?.layout}
          settings={root?.data?.sanitySettings}
          collections={root?.data?.collections}
        >
          <GenericError error={error} />
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layoutMenus(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      id
      name
      description
    }
    headerMenu: menu(handle: $headerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
  }
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
`;

export interface LayoutData {
  headerMenu: EnhancedMenu;
  footerMenu: EnhancedMenu;
  shop: Shop;
  cart?: Promise<Cart>;
}

async function getLayoutData({ storefront }: AppLoadContext) {
  const HEADER_MENU_HANDLE = 'main-menu';
  const FOOTER_MENU_HANDLE = 'footer';

  const data = await storefront.query<LayoutData>(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: HEADER_MENU_HANDLE,
      footerMenuHandle: FOOTER_MENU_HANDLE,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API ');

  /*
    Modify specific links/routes (optional)
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
    e.g here we map:
      - /blogs/news -> /news
      - /blog/news/blog-post -> /news/blog-post
      - /collections/all -> /products
  */
  const customPrefixes = { BLOG: '', CATALOG: 'products' };

  const headerMenu = data?.headerMenu
    ? parseMenu(data.headerMenu, customPrefixes)
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(data.footerMenu, customPrefixes)
    : undefined;

  return { shop: data.shop, headerMenu, footerMenu };
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                tags
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

export async function getCart({ storefront }: StorefrontContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const { cart } = await storefront.query<{ cart?: Cart }>(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}

const COLLECTIONS_ORDER_QUERY = `#graphql
  {
    collections(first: 100) {
      nodes {
        id
        metafields(
          identifiers: [{namespace: "custom", key: "index"}]
        ) {
          id
          key
          value
        }
      }
    }
  }
`;

export async function getCollectionsOrder({ storefront }: StorefrontContext) {
  invariant(storefront, 'missing storefront client in cart query');

  const { collections } = await storefront.query(COLLECTIONS_ORDER_QUERY, {
    cache: storefront.CacheLong(),
  });
  return collections;
}
