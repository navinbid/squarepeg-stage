import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  flattenConnection,
  ShopifyAnalyticsProduct,
  useMoney,
} from '@shopify/hydrogen';
import type { SerializeFrom } from '@shopify/remix-oxygen';
import { Text, Link, AddToCartButton, IconWarning } from '~/components';
import { getArrivalDate, isDiscounted, isNewArrival } from '~/lib/utils';
import { getProductPlaceholder } from '~/lib/placeholders';
import type { MoneyV2, Product } from '@shopify/hydrogen/storefront-api-types';
import { HeaderText } from './HeaderText';
import { BODY_TEXT_STYLES, BodyText } from './BodyText';
import { DiscountDetails } from '~/routes/($lang)/productdetails/$productHandle';
import { FavoriteButton } from './FavoriteButton';
import { MetafieldType, parseMetafields } from '~/lib/metafields';
import QuickViewModal from './QuickViewModal';
import OutOfStockModal from './OutOfStockModal';
import ImageWithFallback from './ImageWithFallback';
import { useFetcher } from '@remix-run/react';

export function ProductQuantitySection({
  minimumQuantity = '1',
  quantityInterval = '1',
}: {
  minimumQuantity?: string;
  quantityInterval?: string;

}) {

  return (
    <div className="flex flex-col lg:flex-row gap-x-2">
      <BodyText level="subtitle-2" className="lg:border-r lg:pr-2">
        *Min Order Qty: {minimumQuantity}
      </BodyText>
      <BodyText level="subtitle-2">
        Qty Interval: {quantityInterval}
      </BodyText>
    </div>
  );
}

export type ProductWithDiscount = Product & {
  discountDetails?: {
    amount: number;
    minimumQuantity: number;
    flatDiscount: number;
  };
};

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: SerializeFrom<ProductWithDiscount> & {
    metafields?: MetafieldType[];
  };
  title?: string;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {

  const { load, data } = useFetcher();

  useEffect(() => {
    load(`/product/${product.handle}`);
  }, [load, product.handle]);


  const category = data?.sanityProduct?.subcollection?.parentCollection?.slug?.current || 'product';

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  let cardLabel;

  const parsedMetafields = parseMetafields(product.metafields!);

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) {
    console.warn('ProductCard: No variants found for product', product);
    return null;

  }

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  // @ts-ignore
  // const moneyObject = useMoney(firstVariant?.price || null);

  if (!firstVariant) {
    console.warn('ProductCard: No variants found for product', product);
    return null;
  }
  const { image, price, compareAtPrice } = firstVariant;

  const productIsDiscounted = isDiscounted(
    price as MoneyV2,
    compareAtPrice as MoneyV2,
  );

  if (label) {
    cardLabel = label;
  } else if (productIsDiscounted) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  const priceAmount = firstVariant?.price?.amount;

  const [priceDollars, priceCents] = priceAmount?.split('.') || [];

  const discountPercentage = productIsDiscounted
    ? Math.round(
      // @ts-ignore
      ((firstVariant?.compareAtPrice?.amount -
        // @ts-ignore
        firstVariant?.price?.amount) /
        // @ts-ignore
        firstVariant?.compareAtPrice?.amount) *
      100,
    )
    : 0;

  const maxItemQuantity = firstVariant?.quantityAvailable || 1;

  const minimumQuantity = parsedMetafields?.minimumQuantity || null;
  const quantityInterval = parsedMetafields?.quantityInterval || null;
  const isOutOfStock = !firstVariant?.availableForSale || parseInt(minimumQuantity) > maxItemQuantity;

  return (
    <>

      {quickViewOpen && (
        <QuickViewModal
          handle={product.handle}
          isOpen={quickViewOpen}
          setIsOpen={setQuickViewOpen}
        />
      )}
      <div className="flex flex-col gap-2 relative">
        <div className="absolute top-4 right-4 z-20">
          <FavoriteButton product={product as Product} />
        </div>
        <div className={clsx('grid gap-4', className)}>
          <div className="relative group overflow-hidden">
            <Link
              className="card-image bg-primary/5"
              onClick={onClick}
              to={`/${category}/${product.handle}`}
              prefetch="intent"
            >
              <ImageWithFallback
                className="aspect-square object-cover fadeIn w-[118px] h-[118px] sm:w-[160px] sm:h-[160px] lg:w-[232px] lg:h-[232px] mx-5 my-2 lg:mx-9 lg:my-3"
                width={232}
                sizes="232px"
                crop="center"
                height={232}
                data={image}
                alt={image?.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            </Link>

            <button
              onClick={(e) => {
                setQuickViewOpen(true);
              }}
              className="outline-none z-10 hidden xl:absolute xl:flex xl:justify-center xl:items-center h-14 transition-all ease-in duration-200 -bottom-14 group-hover:bottom-0 py-4 px-5 bg-neutral-92 w-full font-bold text-base rounded-b-lg"
            >
              Quick View
            </button>
            {/* @TODO: Ask if there will be a sale label on cards */}
            {/* <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text> */}
          </div>
          <Link
            onClick={onClick}
            to={`/${category}/${product.handle}`}
            prefetch="intent"
          >
            <div className="grid gap-1">
              <BodyText
                className="h-[60px] lg:h-[72px] line-clamp-3 text-neutral-8 text-sm lg:text-base"
                level="title-2"
              >
                {product.title}
              </BodyText>
              <div className="flex">
                <HeaderText className="!mb-0" level="3">
                  ${priceDollars}
                </HeaderText>
                <HeaderText level="6" className="pt-[3.5px]">
                  {priceCents
                    ? `.${priceCents.length < 2 ? `${priceCents}0` : priceCents
                    }`
                    : null}
                </HeaderText>
                {
                  parsedMetafields?.unit_of_measure
                    ?
                    <p className='ml-2.5 text-lg text-black/75 font-bold !h-auto'>{parsedMetafields?.unit_of_measure}</p>
                    :
                    <p className='ml-2.5 text-lg text-black/75 font-bold'>each</p>
                }
                {/* <Text className="flex gap-4">
                <Money withoutTrailingZeros data={price!} />
              </Text> */}
              </div>
              <div className="flex items-center gap-1 h-4">
                {discountPercentage > 0 && (
                  <>
                    <CompareAtPrice
                      className={'line-through'}
                      data={compareAtPrice as MoneyV2}
                    />
                    <div className="uppercase text-xs text-success font-extrabold">
                      Save {discountPercentage}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Hold discount space if doesn't exist */}
        <div className={`hidden ${product?.discountDetails ? 'visible' : 'invisible'}`}>
          <DiscountDetails
            minimumQuantity={product?.discountDetails?.minimumQuantity}
            standardPrice={Number(price?.amount)}
            // @ts-ignore
            discountAmount={product?.discountDetails}
          />
        </div>

        {firstVariant.availableForSale && quickAdd && (
          <AddToCartButton
            lines={[
              {
                quantity: Number(minimumQuantity) || 1,
                merchandiseId: firstVariant.id,
              },
            ]}
            product={{
              title: product.title,
              handle: product.handle,
            }}
            variant="primary"
            className="mt-1"
            analytics={{
              products: [productAnalytics],
              totalValue: parseFloat(productAnalytics.price),
            }}
          >
            <Text as="span" className="flex items-center justify-center gap-2">
              Add To Cart
            </Text>
          </AddToCartButton>
        )}


        {!firstVariant.availableForSale && (
          <OutOfStockModal
            buttonClasses="mt-1"
            product={product}
            variant={firstVariant.id}
          />
        )}
        {/* Hold qty space if doesn't exist */}

        {/* Product Quantity section and date section */}

        <div
          className={
            minimumQuantity && quantityInterval ? 'visible' : 'invisible'
          }
        >
          <ProductQuantitySection
            minimumQuantity={minimumQuantity}
            quantityInterval={quantityInterval}
          />
        </div>

        <div className="flex items-center gap-1">
          {!isOutOfStock && <p className="text-neutral-8 text-sm">Get {firstVariant?.quantityAvailable} by <span className='font-extrabold'>{getArrivalDate()}</span></p>}
        </div>

        <div
          className={clsx(
            product?.tags?.includes('prop65') ? 'visible' : 'invisible',
          )}
        >
          <a
            className="underline flex items-center gap-1 text-sm"
            href="https://www.p65warnings.ca.gov/"
            target="_blank"
            rel="noreferrer"
          >
            <IconWarning className="h-6 w-6" />
            <div className="text-sm">Prop 65 Warning</div>
          </a>
        </div>
      </div>
    </>
  );
}

export function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {
    currencyNarrowSymbol,
    withoutTrailingZerosAndCurrency,
    localizedString,
    ...rest
  } = useMoney(data);

  const styles = clsx('text-neutral-44 text-xs font-semibold', className);

  return <span className={styles}>{localizedString}</span>;
}
