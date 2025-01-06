import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {Heading, IconArrowLeft, ProductCard, Section} from '~/components';
import {useRef} from 'react';
import {HeaderText} from './HeaderText';
import useElementWidth from '~/hooks/useElementWidth';
import clsx from 'clsx';

const mockProducts = new Array(12).fill('');

const SCROLL_DIRECTIONS = ['left', 'right'] as const;

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}: {
  title?: string;
  products?: SerializeFrom<Product[]>;
  count?: number;
}) {
  const swimlaneRef = useRef<HTMLDivElement>(null);
  const maskLeftGutterRef = useRef(null);
  const gutterSize = useElementWidth(maskLeftGutterRef) || 0;
  // we need this because we don't apply the gutter until it exceeds mx-12
  const minLeftPadding = 48;

  function scrollSwimlane(direction: 'left' | 'right') {
    if (!swimlaneRef.current) return;
    const scrollAmount = swimlaneRef.current.offsetWidth / 2;
    swimlaneRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  return (
    <>
      <div className="flex justify-between items-center content-wrapper pb-12">
        <HeaderText style={{margin: 0}} level="2">
          {title}
        </HeaderText>
        <div className="hidden md:flex gap-2">
          {SCROLL_DIRECTIONS.map((direction) => (
            <button
              key={direction}
              onClick={() => scrollSwimlane(direction)}
              className="rounded-full border-2 border-neutral-8 p-3 hover:bg-black/10 active:bg-black/20 focus:outline-none"
            >
              <div className="sr-only">
                Scroll {direction === 'left' ? 'left' : 'right'}
              </div>
              <IconArrowLeft
                className={clsx(
                  direction === 'left' ? '' : 'rotate-180',
                  'fill-neutral-8',
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden">
        {/* this margin is to push the swimlane over to match the content-wrapper auto margins */}
        <div
          // minLeftPadding is the minimum padding before we start needing margin spacing from the regular mx-auto
          style={
            gutterSize > minLeftPadding
              ? {
                  paddingLeft: `${gutterSize}px`,
                  paddingRight: `${gutterSize}px`,
                }
              : {}
          }
          // no scrollbar bc this design requires a custom scroll component?
          className={clsx(
            'swimlane custom-scrollbar scroll-px-6 px-0 no-scrollbar',
            gutterSize < minLeftPadding && `ml-5 md:ml-8 lg:ml-12`,
          )}
          ref={swimlaneRef}
        >
          {products.map((product) => (
            <ProductCard
              // @ts-ignore
              product={product}
              key={product.id}
              className="w-40 lg:w-[304px]"
              quickAdd
            />
          ))}
          {/* mask needs to match the layout */}
          <div className="mask absolute top-0 left-0 z-10 h-full w-full pointer-events-none">
            <div
              className="bg-gradient-to-r from-white to-transparent"
              ref={maskLeftGutterRef}
            ></div>
            <div></div>
            <div className="bg-gradient-to-l from-white to-transparent"></div>
          </div>
        </div>
      </div>
    </>
  );
}
