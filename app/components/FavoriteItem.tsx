import {
  Money,
  ShopifyAnalyticsProduct,
  flattenConnection,
} from '@shopify/hydrogen';
import { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import {
  Heading,
  Text,
  Link,
  IconStockIndicator,
  IconWarning,
  AddToCartButton,
} from '~/components';
import { BodyText } from './BodyText';
import ImageWithFallback from './ImageWithFallback';
import { useEffect, useState } from 'react';
import OutOfStockModal from './OutOfStockModal';
import { CartLinePrice } from './Cart';
import { FavoriteButton } from './FavoriteButton';
import { isDiscounted } from '~/lib/utils';
import { CompareAtPrice, ProductWithDiscount } from './ProductCard';
import { DiscountDetails } from '~/routes/($lang)/productdetails/$productHandle';
import { parseMetafields } from '~/lib/metafields';
import { HeaderText } from './HeaderText';
import { useFetcher } from '@remix-run/react';

export type ProductWithDiscountAndVariantId = ProductWithDiscount & {
  variantId: number;
};

export function FavoriteItem({
  product,
}: {
  product: ProductWithDiscountAndVariantId;
}) {

  const { load, data } = useFetcher();

  useEffect(() => {
    load(`/product/${product.handle}`);
  }, [load, product.handle]);


  const category = data?.sanityProduct?.subcollection?.parentCollection?.slug?.current || 'product';

  const firstVariant = flattenConnection(product.variants)[0];

  const parsedMetafields = parseMetafields(product.metafields);
  const manufacturerPartNumber = parsedMetafields?.manufacturerPartNumber;
  const minimumQuantity = Number(parsedMetafields?.minimumQuantity) || 1;
  const quantityInterval = Number(parsedMetafields?.quantityInterval) || 1;

  const maxItemQuantity = firstVariant?.quantityAvailable || 1;

  const [quantity, setQuantity] = useState(Number(minimumQuantity) || 1);

  const isOutOfStock =
    !firstVariant?.availableForSale || minimumQuantity > maxItemQuantity;

  const itemActionProps = {
    firstVariant,
    product,
    quantity,
    isOutOfStock,
  };

  const productIsDiscounted = isDiscounted(
    firstVariant.price,
    firstVariant.compareAtPrice,
  );

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

  const priceAmount = firstVariant?.price?.amount;

  const [priceDollars, priceCents] = priceAmount?.split('.') || [];

  return (
    <div className="flex py-8 gap-8">
      <li
        key={product.id}
        className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-8 w-full"
      >
        <div className="basis-full lg:basis-auto bg-neutral-96 rounded-lg flex justify-center items-center py-2 lg:py-3 lg:px-6">
          <ImageWithFallback
            width={220}
            height={220}
            data={firstVariant?.image}
            className="aspect-square object-contain fadeIn w-[118px] h-[118px] lg:w-[176px] lg:h-[176px]"
            alt={firstVariant?.image?.altText || product?.title}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-1 justify-between gap-x-8">
            <div className="flex flex-col gap-2">
              {/* product title */}
              <Heading
                as="h3"
                className="text-base lg:text-lg font-extrabold line-clamp-2"
              >
                {product?.handle ? (
                  <Link to={`/${category}/${product.handle}`}>
                    {product?.title || ''}
                  </Link>
                ) : (
                  <Text>{product?.title || ''}</Text>
                )}
              </Heading>
              {/* product subtitles */}
              <div className="flex divide-x gap-2">
                <BodyText level="subtitle-2" className="!text-xs !lg-text-sm">
                  Part #<span className="uppercase">{product.handle}</span>
                </BodyText>
                {Boolean(manufacturerPartNumber) && (
                  <BodyText
                    level="subtitle-2"
                    className="pl-2 uppercase !text-xs !lg-text-sm"
                  >
                    MFG #{manufacturerPartNumber}
                  </BodyText>
                )}
              </div>
              {/* Price & Compare at Price */}
              <div className="flex flex-col">
                <Text className="!text-2xl font-bold">
                  {/* @TODO */}
                  {/* <CartLinePrice
                    line={{
                      // @ts-ignore
                      cost: {
                        totalAmount: {
                          amount: firstVariant.price.amount,
                          currencyCode: firstVariant.price.currencyCode,
                        },
                        amountPerQuantity: {
                          amount: firstVariant.price.amount,
                          currencyCode: firstVariant.price.currencyCode,
                        },
                      },
                    }}
                    as="span"
                  /> */}
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
                        <p className='ml-2.5 text-lg text-black/75 font-bold'>{parsedMetafields?.unit_of_measure}</p>
                        :
                        <p className='ml-2.5 text-lg text-black/75 font-bold'>each</p>
                    }
                    {/* <Text className="flex gap-4">
                <Money withoutTrailingZeros data={price!} />
              </Text> */}
                  </div>
                </Text>
                <div className="flex items-center gap-1 h-4">
                  {discountPercentage > 0 && (
                    <>
                      <CompareAtPrice
                        className={'line-through'}
                        data={firstVariant.compareAtPrice as MoneyV2}
                      />
                      <div className="uppercase text-xs text-success font-extrabold">
                        Save {discountPercentage}%
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={product?.discountDetails ? 'block' : 'hidden'}>
                <DiscountDetails
                  minimumQuantity={product?.discountDetails?.minimumQuantity}
                  standardPrice={Number(firstVariant.price?.amount)}
                  discountAmount={product?.discountDetails}
                />
              </div>
              {/* In stock indicator */}
              <div className="flex items-center gap-1">
                <IconStockIndicator
                  className={!isOutOfStock ? 'text-success' : 'text-error'}
                />
                <BodyText level="subtitle-2">
                  {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                </BodyText>
              </div>
              {/* Prop65 Warning */}
              {product?.tags?.includes('prop65') && (
                <div className="flex items-center gap-1">
                  <a
                    className="underline flex gap-1 text-sm"
                    href="https://www.p65warnings.ca.gov/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconWarning />
                    <div>Prop 65 Warning</div>
                  </a>
                </div>
              )}
            </div>
          </div>
          {/* Cart Line Footer */}
          <div className="flex flex-1 justify-between items-center gap-4 flex-wrap">
            <div className="flex justify-center md:justify-start items-start text-copy w-full gap-16">
              {!isOutOfStock && (
                <FavoriteQuantityAdjust
                  quantity={quantity}
                  setQuantity={setQuantity}
                  minimumQuantity={minimumQuantity}
                  quantityInterval={quantityInterval}
                  maxItemQuantity={maxItemQuantity}
                />
              )}
              <div className="md:hidden flex-shrink-0 -mt-1">
                <ItemActions {...itemActionProps} />
              </div>
            </div>
          </div>
        </div>
      </li>
      <div className="hidden md:block flex-shrink-0">
        <ItemActions {...itemActionProps} />
      </div>
    </div>
  );
}

function FavoriteQuantityAdjust({
  quantity,
  setQuantity,
  minimumQuantity = 1,
  quantityInterval = 1,
  maxItemQuantity,
}: {
  quantity: number;
  setQuantity: (quantity: number) => void;
  minimumQuantity?: number;
  quantityInterval?: number;
  maxItemQuantity: number;
}) {
  const prevQuantity = Number(
    Math.max(minimumQuantity, quantity - quantityInterval).toFixed(0),
  );
  const nextQuantity = Math.min(
    maxItemQuantity,
    Number((quantity + quantityInterval).toFixed(0)),
  );

  const QtyAdjustButtonClasses =
    'h-12 w-12 flex items-center justify-center text-neutral-8 border rounded-full border-neutral-8 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <>
      <label htmlFor={`quantity`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="flex items-center gap-1.5">
        <button
          name="decrease-quantity"
          aria-label="Decrease quantity"
          className={QtyAdjustButtonClasses}
          value={prevQuantity}
          onClick={() => setQuantity(prevQuantity)}
          disabled={
            quantity <= minimumQuantity || prevQuantity < minimumQuantity
          }
        >
          <span>&#8722;</span>
        </button>

        <input
          className="h-12 w-12 flex justify-center items-center border rounded text-center"
          data-test="item-quantity"
          onChange={(e) => setQuantity(Number(e.target.value))}
          value={quantity}
        />

        <button
          className={QtyAdjustButtonClasses}
          name="increase-quantity"
          value={nextQuantity}
          aria-label="Increase quantity"
          onClick={() => setQuantity(nextQuantity)}
          disabled={nextQuantity === quantity}
        >
          <span>&#43;</span>
        </button>
      </div>
    </>
  );
}

const ItemActions = ({
  firstVariant,
  product,
  quantity,
  isOutOfStock,
}: {
  product: ProductWithDiscountAndVariantId;
  firstVariant: any;
  quantity: number;
  isOutOfStock: boolean;
}) => {
  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity,
  };

  return (
    <div className="flex flex-col items-center gap-4 flex-shrink-0">
      {!isOutOfStock ? (
        <AddToCartButton
          lines={[
            {
              merchandiseId: product?.variantId
                ? `gid://shopify/ProductVariant/${product.variantId}`
                : firstVariant.id,
              quantity: quantity || 1,
            },
          ]}
          product={{
            title: product.title,
            handle: product.handle,
          }}
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(firstVariant.price.amount),
          }}
        >
          <Text
            as="span"
            className="flex items-center justify-center gap-2 font-extrabold"
          >
            Add To Cart
          </Text>
        </AddToCartButton>
      ) : (
        <OutOfStockModal
          buttonClasses="mt-1"
          product={product}
          variant={firstVariant.id}
        />
      )}
      <FavoriteButton
        className="text-center !ml-0"
        product={product}
        variantId={product.variantId}
      >
        Remove
      </FavoriteButton>
    </div>
  );
};
