import {Link} from './Link';
import {SanityBrandType} from '~/lib/sanity-types';
import {HeaderText} from './HeaderText';
import {BodyText} from './BodyText';
import {IconCircleArrowRight} from './Icon';
import {BrandLogoLink} from '~/routes/($lang)/manufacturers';

export type FeaturedBrandsProps = {
  brands: SanityBrandType[];
};

export function FeaturedBrands({brands}: FeaturedBrandsProps) {
  if (!brands) {
    console.error('No brands provided to FeaturedBrands component');
    return null;
  }

  return (
    <div className="content-wrapper">
      <div className="flex flex-wrap gap-y-8 pb-32">
        <div className="flex flex-wrap justify-between items-end flex-1">
          <div className="basis-full lg:basis-auto">
            <HeaderText level="3" className="!mb-2">
              Featured Brands
            </HeaderText>
            <BodyText level="body-2" className="!mb-0">
              Shop from the industry&apos;s most reliable brands and
              manufacturers.
            </BodyText>
          </div>
          <div className="basis-full lg:basis-auto mt-4">
            <Link
              to="/manufacturers"
              className="flex items-center font-extrabold text-brand gap-3"
            >
              Learn More <IconCircleArrowRight />
            </Link>
          </div>
        </div>

        <div className="basis-full grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {brands.map((brand) => (
            <BrandLogoLink key={brand.name} brand={brand} layout="featured" />
          ))}
        </div>
      </div>
    </div>
  );
}
