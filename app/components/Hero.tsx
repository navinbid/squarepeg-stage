import clsx from 'clsx';

import type {SerializeFrom} from '@shopify/remix-oxygen';
import {Text, Button, Link} from '~/components';
import type {CollectionHero} from '~/routes/($lang)/index';
import {urlFor} from '~/lib/sanity';
import {HeaderText} from './HeaderText';

/**
 * Hero component that renders metafields attached to collection resources
 **/
export function Hero({
  byline,
  cta,
  handle,
  heading,
  height,
  loading,
  spread,
  spreadSecondary,
  top,
  image,
  title,
  ...props
}: SerializeFrom<CollectionHero>) {
  const mobileHeroImage = urlFor(image).width(375).height(375).url() as string;
  const desktopHeroImage = urlFor(image).url() as string;
  return (
    <section
      className={clsx(
        'relative justify-end flex flex-col-reverse w-full',
        // top && '-mt-nav',
        // height === 'full'
        //   ? 'h-screen'
        //   : 'aspect-[4/5] sm:aspect-square md:aspect-[5/4] lg:aspect-[3/2] xl:aspect-[2/1]',
      )}
    >
      <div className="md:absolute inset-0 grid flex-grow grid-flow-col pointer-events-none auto-cols-fr -z-10 content-stretch overflow-clip">
        {Boolean(image) && (
          <div className="relative">
            <figure className="block object-cover w-full h-full aspect-[3/2] md:aspect-auto">
              <picture>
                <source
                  srcSet={mobileHeroImage}
                  media="(max-width: 768px)"
                  type="image/webp"
                />
                <source
                  srcSet={desktopHeroImage}
                  media="(min-width: 769px)"
                  type="image/webp"
                />
                <img
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  src={mobileHeroImage}
                  alt={byline as string}
                />
              </picture>
            </figure>
            {/* <img
              className="block object-cover w-full h-full aspect-[3/2] md:aspect-auto"
              src={urlFor(image).url() as string}
              alt={byline as string}
            /> */}
          </div>
        )}
      </div>
      {/* dont use wrapper here because of padding */}
      <div className="w-full md:box-content md:max-w-[1312px] md:mx-auto md:px-8 lg:px-12 md:my-[124px]">
        <div
          className="flex flex-col items-baseline justify-between px-5 py-12 md:p-16 text-white md:max-w-[528px] md:rounded-b-[48px] md:rounded-tl-[48px] bg-neutral-8 md:bg-hero-transparent"
          // style={{background: 'rgba(22, 14, 27, 0.88)'}}
        >
          {title && (
            <HeaderText as="h2" level="display" className="leading-none">
              {title}
            </HeaderText>
          )}
          {byline && (
            <Text
              format
              width="narrow"
              as="p"
              size="lead"
              className="leading-7"
            >
              {byline}
            </Text>
          )}
          {Boolean(cta) && (
            <Link to="/search">
              <Button className="!font-extrabold w-full md:w-auto mt-9">
                {cta}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// interface SpreadMediaProps {
//   data: Media | MediaImage | MediaVideo;
//   loading?: HTMLImageElement['loading'];
//   scale?: 2 | 3;
//   sizes: string;
//   width: number;
//   widths: number[];
// }

// function SpreadMedia({
//   data,
//   loading,
//   scale,
//   sizes,
//   width,
//   widths,
// }: SpreadMediaProps) {
//   return (
//     <MediaFile
//       data={data}
//       className="block object-cover w-full h-full"
//       mediaOptions={{
//         video: {
//           controls: false,
//           muted: true,
//           loop: true,
//           playsInline: true,
//           autoPlay: true,
//           width: (scale ?? 1) * width,
//           previewImageOptions: {src: data.previewImage?.url ?? ''},
//         },
//         image: {
//           loading,
//           // loaderOptions: {scale, crop: 'center'},
//           widths,
//           sizes,
//           width,
//           alt: data.alt || '',
//         },
//       }}
//     />
//   );
// }
