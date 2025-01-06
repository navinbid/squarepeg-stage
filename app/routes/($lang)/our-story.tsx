import { defer, type LoaderArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData } from '@remix-run/react';
import { AnalyticsPageType } from '@shopify/hydrogen';

import {
  Button,
  GradientLogoDesktop,
  GradientLogoMobile,
  Heading,
  Link,
  Section,
  Text,
} from '~/components';
import { getFeaturedBrands } from '~/lib/sanity';
import { FeaturedBrands } from '~/components/FeaturedBrands';
import { SanityBrandType } from '~/lib/sanity-types';
import { Benefits } from '~/components/Benefits';
import { VALUES } from '~/lib/static-content';
import ImgDifference from '~/assets/about-squarepeg-difference.jpg';
import ImgForPros from '~/assets/about-for-pros.png';
import MediaTextBlock from '~/components/MediaTextBlock';

export const handle = {
  seo: {
    title: 'About Us | Square Peg',
    description: "Learn more about SquarePeg's story.",
  },
};

export async function loader({ params, context }: LoaderArgs) {
  const featuredBrands = await getFeaturedBrands();

  return defer({
    featuredBrands,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export default function AboutPage() {
  const { featuredBrands } = useLoaderData<typeof loader>();

  return (
    <>
      {/* About Hero */}
      <AboutHero />
      {/* Media Text Blocks */}
      <div className="bg-neutral-98">
        <div className="py-36 flex flex-col gap-24 content-wrapper">
          <MediaTextBlock
            firstContent="media"
            title="The SquarePeg Difference"
            media={ImgDifference}
          >
            <Text
              as="span"
              size="copy"
              className="text-neutral-8 leading-[28px] text-lg"
            >
              It can be hard to find the right solution for your projects on
              your schedule. SquarePeg’s extensive stock of high-quality,
              top-rated products has what you need for any project. With our 80+
              years of experience in the industry, you can depend on us for
              excellent materials and fast shipping. Online or on the line,
              we’re your right fit, every time.
            </Text>
          </MediaTextBlock>
          <MediaTextBlock
            firstContent="text"
            title="For Pros"
            media={ImgForPros}
          >
            <Text
              as="span"
              size="copy"
              className="mb-8 block text-neutral-8 leading-[28px] text-lg"
            >
              SquarePeg offers personable, professional support to the
              industry’s pros with our Pro Program. We offer special perks like
              discounted pricing, one-to-one personal service, easy returns and
              reorders, and exclusive gear and materials.
            </Text>
            <Link
              className="block text-brand font-extrabold underline decoration-brand/50 underline-offset-4"
              to="/pro"
            >
              <Button variant="tertiary">Learn More</Button>
            </Link>
          </MediaTextBlock>
        </div>
      </div>
      <div className="content-wrapper !pt-32 !pb-36">
        {/* Section Heading isn't big enough */}
        <Heading size="heading" className="text-center mb-12">
          The Values We Stand By
        </Heading>
        <Benefits orientation="vertical" content={VALUES} />
      </div>
      <FeaturedBrands brands={featuredBrands as SanityBrandType[]} />
    </>
  );
}

export function AboutHero() {
  return (
    <div className="bg-primary-green z-0 isolate">
      <div className="pt-40 pb-44 text-white min-h-full flex flex-col justify-center items-start content-wrapper relative">
        <hgroup className="z-10 flex flex-col gap-6">
          <Heading className="text-xl md:text-2xl font-extrabold leading-6 lg:leading-8">
            About Us
          </Heading>
          <Heading
            size="display"
            className="text-[40px] lg:text-[64px] font-extrabold leading-[44px] lg:leading-none lg:max-w-[1088px]"
          >
            Where creativity meets possibility. <br />
            <span className="text-primary-lime">Always the right fit</span>, our
            team partners with you for the solutions and products you need.
          </Heading>
        </hgroup>
        <GradientLogoDesktop className="absolute right-0 h-full z-0 px-5 md:px-8 lg:px-12 hidden lg:block" />
        <GradientLogoMobile className="absolute bottom-0 left-0 pb-12 z-0 px-5 md:px-8 lg:hidden" />
      </div>
    </div>
  );
}
