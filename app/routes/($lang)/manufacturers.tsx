import { defer, type LoaderArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData } from '@remix-run/react';
import { AnalyticsPageType } from '@shopify/hydrogen';

import {
  Heading,
  IconCaret,
  IconShapesBorderAccent,
  IconShapesBorderAccentMobile,
  Link,
  Section,
  Text,
} from '~/components';
import { getBrands, getFeaturedBrands } from '~/lib/sanity';
import { urlFor } from '~/lib/sanity';
import PlaceholderImage from '~/assets/logo-placeholder.png';
import MediaTextBlock from '~/components/MediaTextBlock';
import ImagePartners from '~/assets/manufacturers-partner.png';
import ImageHero from '~/assets/manufacturers-hero.png';
import Logo from '~/assets/logo-bg.svg';
import DiscoverMoreSection from '~/components/DiscoverMoreSection';
import { useState } from 'react';
import clsx from 'clsx';
import { Listbox } from '@headlessui/react';
import { BrandFilters } from '~/lib/static-content';

export const handle = {
  seo: {
    title: 'Our Product Manufacturers | Square Peg',
    description: "Browse SquarePeg's product manufacturers.",
  },
};

export async function loader({ params, context }: LoaderArgs) {
  const brands = await getBrands();
  const featuredBrands = await getFeaturedBrands();

  return defer({
    featuredBrands,
    brands,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export function BrandLogoLink({ brand, layout }) {
  const container = {
    search: 'h-[96px]',
    featured: 'h-[85px]',
  };
  return (
    <Link
      className={clsx(
        'w-full rounded-lg flex justify-center items-center',
        container[layout],
      )}
      key={brand.name}
      to={`/search?vendor=${brand.name}`}
    >
      <img
        loading="lazy"
        className={clsx('aspect-auto max-h-full py-5 px-3 object-contain')}
        src={urlFor(brand.logo).height(85).url() || PlaceholderImage}
        alt={brand.name}
      />
    </Link>
  );
}

export default function ManufacturersPage() {
  const { featuredBrands, brands } = useLoaderData<typeof loader>();

  return (
    <>
      {/* About Hero */}
      <ManufacturersHero />
      {/* Content Blocks */}
      <div className="bg-neutral-98">
        <div className="py-32 content-wrapper">
          <MediaTextBlock
            firstContent="media"
            title="We Partner With the Best"
            media={ImagePartners}
          >
            <Text className="text-neutral-8 leading-[28px] text-lg">
              We only offer the highest quality products in the industry from
              brands with outstanding records of success and longevity. Whether
              you’re looking for top-tier, name brands to budget-friendly,
              value-based manufacturers, you will find the same exceptional
              quality across our entire site.
            </Text>
          </MediaTextBlock>
        </div>
      </div>

      {/* Brands */}
      <div className="content-wrapper mt-32">
        <Heading className="text-center pb-6">Top Brands We Sell</Heading>
        <Text className="text-center mx-auto block">
          Shop from the industry&apos;s most reliable brands and manufacturers.
        </Text>
        <div className="my-[72px] basis-full grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {featuredBrands.map((brand) => (
            <BrandLogoLink key={brand.name} brand={brand} layout="featured" />
          ))}
        </div>
      </div>

      {/* Brands We Sell */}
      <div className="content-wrapper mt-32">
        <Heading className="text-center pb-6">Brands We Sell</Heading>
        <Text className="text-center mx-auto block">
          Shop from the industry’s most reliable brands and manufacturers.
        </Text>
        <BrandSearch brands={brands} />
      </div>

      {/* Shop the Best */}
      <DiscoverMoreSection
        title="Shop the Best Products Today"
        body="Browse our wide selection of products, from HVAC and plumbing to tools and accessories. Anything you order from us will be high-quality, shipped quickly, and the right fit for your needs."
        links={[{ label: 'Shop Now', to: '/search' }, { label: 'Our Resources', to: '/blogs' },]}
      />
    </>
  );
}

export function ManufacturersHero() {
  return (
    <div className="relative overflow-hidden bg-primary-green">
      <div className="flex flex-wrap content-wrapper">
        <div className="flex flex-col basis-full md:basis-auto justify-start gap-6 py-16 md:pt-40 md:pb-44">
          <h2 className="text-white text-[40px] md:text-[64px] font-extrabold leading-[44px] md:leading-none whitespace-nowrap">
            Our Brands
          </h2>
          <p className="text-neutral-80 block !max-w-[412px] text-[22px] leading-8 md:text-[26px] md:leading-9 font-normal">
            Explore Our Trusted Partnerships and Discover the Best Brands for
            Your Every Need.
          </p>
        </div>
        <div
          style={{ backgroundImage: `url(${ImageHero})` }}
          className="min-h-[244px] sm:min-h-[360px] basis-full md:basis-auto flex flex-col flex-1 bg-cover bg-no-repeat bg-primary-green -mx-5 md:mx-0 z-0"
        >
          <div className="hidden md:block w-full h-full bg-gradient-to-r from-primary-green via-transparent to-primary-green"></div>
          <div className="mt-auto md:hidden w-full h-1/2 bg-gradient-to-t from-primary-green to-transparent"></div>
        </div>
      </div>

      {/* Desktop Only Image Accent */}
      <IconShapesBorderAccent className="hidden absolute 2xl:block lg:w-auto lg:bottom-auto lg:-right-12 lg:top-0 lg:h-full" />
      {/* Mobile only Bottom Image Accent */}
      <div
        style={{ backgroundImage: `url(${Logo})` }}
        className="h-[120px] md:hidden w-full bg-repeat-space"
      ></div>
    </div>
  );
}

export function BrandSearch({ brands }) {
  const [selectedFilter, setSelectedFilter] = useState('#');
  const filteredBrands = brands.filter((brand) => {
    if (selectedFilter === '#') {
      return /^[0-9]*$/.test(brand?.name[0]);
    } else {
      return brand.name.startsWith(selectedFilter);
    }
  });

  function changeFilter(option) {
    setSelectedFilter(option);
  }

  return (
    <div className="md:divide-y">
      {/* Desktop Brand Filters */}
      <div className="hidden md:flex gap-2 flex-wrap my-[72px]">
        {BrandFilters.map((option) => (
          <button
            key={option}
            className={clsx(
              selectedFilter === option && 'bg-brand text-white',
              'h-10 w-10 border-brand border rounded-[4px] text-lg font-extrabold text-brand flex justify-center items-center',
            )}
            onClick={() => setSelectedFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {/* Mobile Brand Filters */}
      <div className="flex md:hidden mt-12">
        <Listbox value={BrandFilters} onChange={changeFilter}>
          <Listbox.Label>
            <Heading size="lead">Shop By Manufacturer:&nbsp;</Heading>
          </Listbox.Label>
          <div className="relative flex-1">
            <Listbox.Button className="flex justify-between items-center w-full">
              <Heading size="lead">{selectedFilter}</Heading>
              <IconCaret className="block" height="28px" width="28px" />
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 bg-white border right-0 max-h-36 overflow-auto w-full rounded-sm flex flex-col divide-y divide-neutral-88">
              {BrandFilters.map((filter) => (
                <Listbox.Option
                  key={filter}
                  value={filter}
                  className={clsx(
                    selectedFilter === filter && 'font-extrabold bg-brand/20',
                    'px-4 py-2',
                  )}
                >
                  {filter}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Brand Results */}
      <div aria-live="polite">
        <Heading className="mt-9 mb-12">{selectedFilter}</Heading>
        <nav>
          <ul className="my-[72px] basis-full grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBrands.map((brand) => (
              <li key={brand.name}>
                <BrandLogoLink brand={brand} layout="search" />
              </li>
            ))}
          </ul>
        </nav>
        {filteredBrands.length === 0 && (
          <Text className="block text-center mx-auto">
            No matching brands found.
          </Text>
        )}
      </div>
    </div>
  );
}
