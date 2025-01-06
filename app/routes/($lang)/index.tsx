import { defer, type LoaderArgs } from '@shopify/remix-oxygen';
import { Suspense } from 'react';
import { Await, useLoaderData } from '@remix-run/react';
import { ProductSwimlane, Hero } from '~/components';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import type { Metafield } from '@shopify/hydrogen/storefront-api-types';
import { AnalyticsPageType, SeoHandleFunction } from '@shopify/hydrogen';
import {
  getFeaturedBrands,
  getHomepageCollection,
  getHomepageSlides,
} from '~/lib/sanity';
import { FeaturedBrands } from '~/components/FeaturedBrands';
import { Benefits } from '~/components/Benefits';
import { ImageSlider } from '~/components/ImageSlider';
import DiscoverMoreSection from '~/components/DiscoverMoreSection';
import { getFeaturedProductsWithDiscounts } from '~/lib/shopify-admin.server';
import { BENEFITS } from '~/lib/static-content';
import logoFull from '~/../public/logo-full.svg';

interface HomeSeoData {
  shop: {
    name: string;
    description: string;
  };
}

export interface CollectionHero {
  byline: string;
  cta: string;
  handle: string;
  heading: Metafield;
  height?: 'full';
  loading?: 'eager' | 'lazy';
  spread: Metafield;
  spreadSecondary: Metafield;
  top?: boolean;
  title: string;
  image: MediaImage;
}

const seo: SeoHandleFunction<typeof loader> = () => ({
  title: 'Order HVAC, Plumbing, & Home Renovation Supplies | SquarePeg',
  description:
    'Buy equipment, tools, fixtures, supplies, and more online at SquarePeg. We offer fast shipping on all products.',
  media: {
    type: 'image',
    // url: 'https://cdn.shopify.com/oxygen-v2/26755/11736/24009/200131/build/_assets/logo-full-DOEYDUW4.svg',
    url: logoFull,
    alt: 'Square Peg',
    width: 186,
    height: 33,
  },
});

export const handle = {
  seo,
};

export async function loader({ params, context }: LoaderArgs) {
  const { language, country } = context.storefront.i18n;

  if (
    params.lang &&
    params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the lang URL param is defined, yet we still are on `EN-US`
    // the the lang param must be invalid, send to the 404 page
    throw new Response(null, { status: 404 });
  }

  const [{ shop }, { collection }] = await Promise.all([
    context.storefront.query<{
      shop: {
        name: string;
        description: string;
      };
    }>(HOMEPAGE_SEO_QUERY, {
      variables: { handle: 'freestyle' },
      cache: context.storefront.CacheLong()
    }),
    getHomepageCollection(),
    // getHomepageSlides(),
    // context.storefront.query<{
    //   products: ProductConnection;
    // }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY),
  ]);

  // const featuredProductsWithDiscounts = await appendDiscountsToProducts(
  //   featuredProducts.products.nodes,
  // );

  // const filteredProductsWithDiscounts = featuredProductsWithDiscounts.map(
  //   (product) => {
  //     // filter out pro or standard variants based on user pro status
  //     const filteredVariants = getVariantsByUserProStatus(product, context);

  //     // update product with filteredVariants
  //     product.variants.nodes = filteredVariants;
  //     return product;
  //   },
  // );

  // const featuredProductsWithDiscounts = await getFeaturedProductsWithDiscounts(
  //   context,
  // );

  return defer({
    shop,
    // primaryHero: hero,
    // homepageSanityData,
    // homepageProducts,
    homepageCollection: collection,
    homepageSlides: getHomepageSlides(),
    featuredBrands: getFeaturedBrands(),
    // These different queries are separated to illustrate how 3rd party content
    // fetching can be optimized for both above and below the fold.
    // featuredProducts: context.storefront.query<{
    //   products: ProductConnection;
    // }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY),
    // featuredProducts,
    // featuredProducts: featuredProductsWithDiscounts,
    featuredProducts: getFeaturedProductsWithDiscounts(context),
    // secondaryHero: context.storefront.query<{hero: CollectionHero}>(
    //   COLLECTION_HERO_QUERY,
    //   {
    //     variables: {
    //       handle: 'backcountry',
    //       country,
    //       language,
    //     },
    //   },
    // ),
    // featuredCollections: context.storefront.query<{
    //   collections: CollectionConnection;
    // }>(FEATURED_COLLECTIONS_QUERY, {
    //   variables: {
    //     country,
    //     language,
    //   },
    // }),
    // tertiaryHero: context.storefront.query<{hero: CollectionHero}>(
    //   COLLECTION_HERO_QUERY,
    //   {
    //     variables: {
    //       handle: 'winter-2022',
    //       country,
    //       language,
    //     },
    //   },
    // ),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export default function Homepage() {
  const { featuredProducts, homepageSlides, homepageCollection, featuredBrands } =
    useLoaderData<typeof loader>();

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  // @ts-ignore
  const homepageHero = homepageCollection?.hero;

  return (
    <>
      {Boolean(homepageHero) && (
        <Hero
          title={homepageHero.title}
          byline={homepageHero.description}
          image={homepageHero.content[0].image}
          cta={homepageHero.callToAction}
          loading="eager"
        />
      )}

      <div className="content-wrapper my-32">
        <Benefits orientation="horizontal" content={BENEFITS} />
      </div>

      <div className="content-wrapper my-32">
        {Boolean(homepageSlides) && (
          <Suspense>
            <Await resolve={homepageSlides}>
              {(slides) => {
                if (!slides) return <></>;
                // @ts-ignore
                return <ImageSlider slides={slides} />;
              }}
            </Await>
          </Suspense>
        )}
      </div>

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {(products) => {
              if (!products) return <></>;
              return (
                <ProductSwimlane
                  products={products}
                  title="Popular Supplies"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {/* {homepageProducts && (
        <Section heading="Homepage Products">
          <Grid layout="products">
            {homepageProducts.map((product) => (
              // @ts-ignore
              <SanityProductCard key={product._id} product={product.store} />
            ))}
          </Grid>
        </Section>
      )} */}
      <DiscoverMoreSection
        title="Discover More from SquarePeg"
        body="Join our community to get our latest updates and access our variety of products and services. Our mission is to help you find the best solution for your projects, whether they’re professional or personal."
        links={[
          { label: 'About Us', to: '/our-story' },
          { label: 'Our Resources', to: '/blogs' },
          { label: 'FAQs', to: '/pages/faq-page' },
        ]}
      />
      {featuredBrands && (
        <Suspense>
          <Await resolve={featuredBrands}>
            {(brands) => {
              if (!brands) return <></>;
              // @ts-ignore
              return <FeaturedBrands brands={brands} />;
            }}
          </Await>
        </Suspense>
      )}

      {/*
      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections.nodes}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )} */}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 250, query: "tag:popular") {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
