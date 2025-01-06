import {
  Form,
  useFetcher,
  useSearchParams,
  useTransition,
} from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';

import { OkendoStarRating } from '@okendo/shopify-hydrogen';
import { Money, ShopifyAnalyticsProduct, useMoney } from '@shopify/hydrogen';
import {
  ProductGallery,
  Section,
  Text,
  Link,
  AddToCartButton,
  Button,
  Input,
  IconMinus,
  IconPlus,
  IconStockIndicator,
  IconWarning,
  IconClose,
} from '~/components';
import type {
  ProductVariant,
  Product as ProductType,
} from '@shopify/hydrogen/storefront-api-types';

import { HeaderText } from '~/components/HeaderText';
import { BodyText } from '~/components/BodyText';
import { parseMetafields } from '~/lib/metafields';
import { ProductQuantitySection } from '~/components/ProductCard';
import {
  DiscountDetails,
  quantityButtonStyles,
} from '~/routes/($lang)/productdetails/$productHandle';
import OutOfStockModal from './OutOfStockModal';
import loader_image from "../assets/load.gif"

export default function QuickViewModal({ handle, isOpen, setIsOpen }) {
  const { load, data } = useFetcher();
  const parsedMetafields = parseMetafields(data?.product?.metafields);
  const manufacturerPartNumber = parsedMetafields?.manufacturerPartNumber;

  useEffect(() => {
    load(`/productdetails/${handle}`);
  }, [load, handle]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 md:p-16">
          <Dialog.Panel className="mx-auto rounded bg-white relative px-24 py-20 max-w-[1088px]">
            <button
              onClick={() => setIsOpen(false)}
              className="z-10 w-8 h-8 rounded-full border border-neutral-8 absolute top-7 right-7 flex justify-center items-center"
            >
              <IconClose />
            </button>
            {/* Preloader start */}
            {
              data == undefined &&
              <div className="grid p-8 pre-loader">
                <img src={loader_image} alt="Pre-loader" />
              </div>
            }
            {/* Preloader end */}
            {data && (
              <div className="grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
                <ProductGallery
                  // @ts-ignore
                  media={data?.product?.media.nodes}
                  className="w-full lg:col-span-2"
                  product={
                    data?.product as ProductType & {
                      selectedVariant?: ProductVariant;
                    }
                  }
                  disableZoom={true}
                />
                <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:pt-nav hiddenScroll md:overflow-y-scroll">
                  <section className="flex flex-col w-full max-w-xl gap-3 md:max-w-sm">
                    <div className="grid gap-3">
                      {data?.sanityProduct?.vendor && (
                        <div className="-mb-1">
                          <Link
                            to={`/search?vendor=${data?.sanityProduct?.vendor}`}
                            className="font-extrabold leading-6 text-brand"
                          >
                            {data?.sanityProduct?.vendor}
                          </Link>
                        </div>
                      )}
                      <HeaderText level="3" className="font-extrabold !mb-0">
                        {data?.sanityProduct?.title}
                      </HeaderText>
                      <div className="flex divide-x gap-2">
                        <BodyText level="subtitle-2">
                          Part #{data?.product.handle}
                        </BodyText>
                        {Boolean(manufacturerPartNumber) && (
                          <BodyText level="subtitle-2" className="pl-2">
                            MFG #{manufacturerPartNumber}
                          </BodyText>
                        )}
                      </div>
                      {data?.product?.okendoReviewsSnippet &&
                        data?.product?.okendoStarRatingSnippet ? (
                        <OkendoStarRating
                          productId={data?.product.id}
                          // @ts-ignore
                          okendoStarRatingSnippet={
                            data?.product.okendoStarRatingSnippet
                          }
                        />
                      ) : (
                        <Text color="subtle">No reviews</Text>
                      )}
                    </div>
                    <ProductForm data={data} />
                  </section>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

export function ProductForm({ data }) {
  const { product, analytics, productDiscount } = data;
  // @ts-ignore
  const parsedMetafields = parseMetafields(product.metafields!);

  const minimumQuantity = Number(parsedMetafields?.minimumQuantity) || 1;
  const quantityInterval = Number(parsedMetafields?.quantityInterval) || 1;

  const [itemQuantity, setItemQuantity] = useState<number | any>(
    Number(minimumQuantity) || 1,
  );

  const [currentSearchParams] = useSearchParams();
  const transition = useTransition();

  const category = data?.sanityProduct?.subcollection?.parentCollection?.slug?.current || 'product';

  /**
   * We update `searchParams` with in-flight request data from `transition` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(() => {
    return transition.location
      ? new URLSearchParams(transition.location.search)
      : currentSearchParams;
  }, [currentSearchParams, transition]);

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const { name, value } of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  // @ts-ignore
  const moneyObject = useMoney(selectedVariant?.price || null);

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  // @ts-ignore
  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity: itemQuantity,
  };

  const handleChange = (e: any) => {
    setItemQuantity(e.target.value);
  };

  const productVariantId = selectedVariant.id;
  const productId = product.id;
  const productUrl = product.handle;
  const maxItemQuantity = product?.totalInventory;

  const discountPercentage = isOnSale
    ? Math.round(
      // @ts-ignore
      ((selectedVariant?.compareAtPrice?.amount -
        // @ts-ignore
        selectedVariant?.price?.amount) /
        // @ts-ignore
        selectedVariant?.compareAtPrice?.amount) *
      100,
    )
    : 0;

  const handleQuantityChange = (e: any) => {
    const { name } = e.target;
    let newQuantity = itemQuantity;
    if (name === 'increment') {
      newQuantity = itemQuantity + quantityInterval;
    } else if (name === 'decrement') {
      newQuantity = itemQuantity - quantityInterval;
    }

    setItemQuantity(Math.min(Math.max(1, newQuantity), maxItemQuantity));
  };

  function validateQuantity(
    event: React.FocusEvent<HTMLInputElement, Element>,
  ) {
    // @ts-ignore
    const newValue = Number(event.target.value);

    if (newValue <= minimumQuantity) {
      setItemQuantity(minimumQuantity);
    } else if (newValue % quantityInterval !== 0) {
      setItemQuantity(
        Math.floor(newValue / quantityInterval) * quantityInterval,
      );
    }
  }

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [priceDollars, priceCents] = selectedVariant?.price?.amount!.split('.');

  const hasProp65Warning = product.tags.includes('prop65');

  return (
    <div className="grid gap-10">
      <div className="grid gap-3">
        <div className="flex gap-2">
          <div className="flex">
            <HeaderText level="2" className="!mb-0">
              <div>
                {moneyObject.currencySymbol}
                {priceDollars}
              </div>
            </HeaderText>
            <HeaderText level="5" className="!mb-0 pt-[3.5px]">
              .{priceCents.length < 2 ? `${priceCents}0` : priceCents}
            </HeaderText>
            {/* Price per unit start */}
            {
              parsedMetafields?.unit_of_measure
                ?
                <p className='ml-2.5 text-lg text-black/75 font-bold !h-auto'>{parsedMetafields?.unit_of_measure}</p>
                :
                <p className='ml-2.5 text-lg text-black/75 font-bold'>each</p>
            }
            {/* Price per unit end */}
          </div>
          {isOnSale && (
            <div>
              <Money
                withoutTrailingZeros
                data={selectedVariant?.compareAtPrice!}
                as="span"
                className="text-neutral-44 line-through text-xs font-bold"
              />
              <HeaderText
                className="uppercase text-success font-extrabold"
                level="6"
              >
                Save {discountPercentage}%
              </HeaderText>
            </div>
          )}
        </div>
        {Boolean(productDiscount) && (
          <DiscountDetails
            minimumQuantity={productDiscount?.minimumQuantity}
            standardPrice={Number(selectedVariant?.price?.amount)}
            discountAmount={productDiscount}
          />
        )}
        {/* <ProductOptions
          // @ts-ignore
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
        /> */}
        {selectedVariant && !isOutOfStock && (
          <div className="grid items-stretch gap-4">
            <div className="flex gap-2">
              <button
                name="decrement"
                className={quantityButtonStyles}
                onClick={handleQuantityChange}
                disabled={itemQuantity === 1}
              >
                <IconMinus className="pointer-events-none" />
                <div className="sr-only">Decrease Quantity</div>
              </button>
              <Input
                value={parseInt(itemQuantity)}
                min={1}
                max={product?.totalInventory || maxItemQuantity}
                onChange={handleChange}
                onBlur={(event) => validateQuantity(event)}
                className="max-w-[48px] text-center"
              />
              <button
                name="increment"
                className={quantityButtonStyles}
                onClick={handleQuantityChange}
                disabled={itemQuantity === maxItemQuantity}
              >
                <IconPlus className="pointer-events-none" />
                <div className="sr-only">Increase Quantity</div>
              </button>
            </div>
            <ProductQuantitySection
              minimumQuantity={parsedMetafields?.minimumQuantity}
              quantityInterval={parsedMetafields?.quantityInterval}
            />
            {!isOutOfStock && (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: parseInt(itemQuantity),
                  },
                ]}
                product={{
                  title: product?.title,
                  handle: product?.handle,
                }}
                variant={isOutOfStock ? 'secondary' : 'primary'}
                data-test="add-to-cart"
                analytics={{
                  products: [productAnalytics],
                  totalValue: productAnalytics.price,
                }}
              >
                {!isOutOfStock && (
                  <Text
                    as="span"
                    className="flex items-center justify-center gap-2 font-extrabold"
                  >
                    Add To Cart
                  </Text>
                )}
              </AddToCartButton>
            )}
            <Link to={`/${category}/${product.handle}`}>
              <Button variant="secondary" className="w-full">
                View Full Details
              </Button>
            </Link>
            {/* @TODO: Update ShopPayButton */}
            {/* {!isOutOfStock && (
              <ShopPayButton variantIds={[selectedVariant?.id!]} />
            )} */}
          </div>
        )}
        {selectedVariant && isOutOfStock && (
          <OutOfStockModal product={product} variant={selectedVariant?.id} />
        )}
        <div className="flex items-center gap-1">
          <IconStockIndicator
            className={isOutOfStock ? 'text-error' : 'text-success'}
          />
          <BodyText level="subtitle-2">
            {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
          </BodyText>
        </div>

        {/* free shipping section */}
        <BodyText level="subtitle-2">
          <Link className="underline" to="/pages/shipping-returns">
            See Shipping Details
          </Link>
        </BodyText>
        {hasProp65Warning && (
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
  );
}
