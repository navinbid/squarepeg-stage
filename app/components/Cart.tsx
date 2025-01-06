import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useScroll } from 'react-use';
import { CartForm, flattenConnection, Money, useMoney } from '@shopify/hydrogen';
import {
  Button,
  Heading,
  IconRemove,
  Text,
  Link,
  FeaturedProducts,
  IconBag,
  IconStockIndicator,
  IconWarning,
} from '~/components';
import { getInputStyleClasses } from '~/lib/utils';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { Breadcrumbs } from './Breadcrumbs';
import { BodyText } from './BodyText';
import ImageWithFallback from './ImageWithFallback';
import { HeaderText } from './HeaderText';
import { MultipassCheckoutButton } from './MultipassCheckoutButton';
import { parseMetafields } from '~/lib/metafields';
import RecentlyViewedProducts from './RecentlyViewedProducts';
import CartEditPopUp from '../components/CartEditPopUp';

declare global {
  interface Window {
    _learnq: any[];
  }
}

type Layouts = 'page' | 'drawer';

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartType | null;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      {linesCount ? (
        <CartDetails cart={cart} layout={layout} />
      ) : (
        <CartEmpty onClose={onClose} layout={layout} />
      )}
    </>
  );
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: CartType | null;
}) {
  // @todo: get optimistic cart cost
  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
    page: 'content-wrapper pb-36 grid md:grid-cols-2 xl:grid-cols-3 md:items-start gap-8 md:gap-8 lg:gap-12',
  };
  return (
    <>
      <div className={container[layout]}>
        <CartLines lines={cart?.lines} layout={layout} />
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <dl className="flex justify-between border-t pt-4 lg:pt-6">
            <Text className="font-bold text-base lg:text-lg" as="dt">
              Estimated Total
            </Text>
            <Text className="font-bold text-lg" as="dd">
              {cart.cost?.totalAmount ? (
                <Money data={cart.cost.totalAmount} />
              ) : (
                '-'
              )}
            </Text>
          </dl>
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      </div>
      <div className="content-wrapper !border-t py-6 md:py-8 lg:py-12">
        <RecentlyViewedProducts
          count={3}
          heading="Recently Viewed Products"
        />
      </div>
    </>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({ discountCodes }) {
  const [searchParams, setSearchParams] = useSearchParams();
  // get query string from navigation
  const location = useLocation();



  const codes =
    discountCodes
      ?.filter((code) => code.applicable)
      .map(({ code }) => code)
      .join(', ') || null;

  const discountError = searchParams.get('invalidDiscount');



  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm discountCodes={undefined}>
              <button className="flex items-center justify-center">
                <IconRemove
                  aria-hidden="true"
                  style={{ height: 18, marginRight: 4 }}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes}</Text>
          </div>
        </div>
      </dl>

      {/* No discounts, show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={undefined}>
        <div
          className={clsx(
            codes ? 'hidden' : 'flex',
            'items-center gap-4 justify-between text-copy',
          )}
        >
          <input
            className={clsx(getInputStyleClasses(), 'lg:h-12')}
            type="text"
            name="discountCode"
            placeholder="Promo Code"
            defaultValue={(discountError as string) || ''}
            onChange={() => {
              // clear search params on change
              setSearchParams({});
            }}
          />
          <Button>Apply</Button>
        </div>
        {discountError && (
          <div className="pt-2">
            <Text className="text-error text-sm">
              &quot;{discountError}&quot; is not a valid discount code
            </Text>
          </div>
        )}
      </UpdateDiscountForm>
    </>
  );
}

// TODO: Fix these types with new Cart Grapqhl Types
function UpdateDiscountForm({
  children,
  discountCodes,
}: {
  children: any;
  discountCodes: any;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);

  const className = clsx([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4 col-span-full md:col-span-1 xl:col-span-2'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
  ]);


  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      {layout === 'page' && (
        <CartPageHeader cartQuantity={currentLines.length} />
      )}
      <ul className="grid gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line as CartLine} layout={layout} />
        ))}
      </ul>
    </section>
  );
}

function CartPageHeader({ cartQuantity }) {
  return (
    <>
      <div className="pt-6 pb-[72px]">
        <Breadcrumbs />
      </div>
      <div className="flex gap-4 pb-12">
        <div className="bg-neutral-92 h-20 w-20 rounded-full flex justify-center items-center">
          <IconBag className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-2">
          <Heading className="!leading-10 !text-[28px] lg:!leading-9 lg:!text-4xl !font-extrabold">
            My Cart
          </Heading>
          <Text className="text-lg">{cartQuantity} Items</Text>
        </div>
      </div>
    </>
  );
}

function CartCheckoutActions({ checkoutUrl }: { checkoutUrl: string }) {
  if (!checkoutUrl) return null;

  return (
    <div className="flex flex-col mt-2 gap-y-3">
      <MultipassCheckoutButton checkoutUrl={checkoutUrl}>
        Secure Checkout
      </MultipassCheckoutButton>
      <Link to="/search">
        <Button variant="secondary" width="full">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartCost;
  layout: Layouts;
}) {
  const summary = {
    drawer: 'grid gap-3 lg:gap-4 p-6 border-t md:px-12',
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 rounded-2xl w-full bg-neutral-98 col-span-full md:col-span-1  mt-10',
  };

  return (
    <section className={summary[layout]}>
      <Heading
        className={clsx(
          'py-2 lg:py-4 border-b',
          layout === 'drawer' ? 'text-lg' : 'text-lg lg:text-heading',
        )}
      >
        Order Summary
      </Heading>
      <dl className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-medium">
          <Text className="font-bold" as="dt">
            Item Subtotal
          </Text>
          <Text as="dd" data-test="subtotal">
            {cost?.subtotalAmount?.amount ? (
              <Money data={cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </Text>
        </div>
        <div className="flex items-center justify-between font-medium">
          <Text className="font-bold" as="dt">
            Estimated Tax
          </Text>
          <Text as="dd">Calculated at Checkout</Text>
        </div>
        <div className="flex items-center justify-between font-medium">
          <Text className="font-bold" as="dt">
            Shipping
          </Text>
          <Text as="dd">Calculated at Checkout</Text>
        </div>
      </dl>
      {children}
    </section>
  );
}

function CartLineItem({
  line,
  layout,
}: {
  line: CartLine;
  layout: 'page' | 'drawer';
}) {

  if (!line?.id) return null;

  const { id, quantity, merchandise } = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  const totalCompareAtCost = {
    amount: (
      parseFloat(line.cost.compareAtAmountPerQuantity?.amount || '0') *
      line.quantity
    ).toString(),
    currencyCode: line.cost.totalAmount.currencyCode,
  };

  const parsedMetafields = parseMetafields(merchandise.product.metafields);
  const manufacturerPartNumber = parsedMetafields?.manufacturerPartNumber;
  const [IsOpen, setIsOpen] = useState(false);

  const lineIds = [id];

  const { load, data } = useFetcher();

  useEffect(() => {
    load(`/product/${merchandise.product.handle}`);
  }, [load, merchandise.product.handle]);

  console.log('Lines', line)

  var cart = {
    total_price: line?.merchandise?.price?.amount,
    items: line
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window._learnq) {
      window._learnq.push(['track', 'Added to Cart', cart]);
    }

  }, [cart])

  const category = data?.sanityProduct?.subcollection?.parentCollection?.slug?.current || 'product';




  return (
    <li key={id} className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-8">
      <div className="basis-full lg:basis-auto bg-neutral-96 rounded-lg flex justify-center items-center py-2 lg:py-3 lg:px-6">
        <ImageWithFallback
          width={220}
          height={220}
          data={merchandise.image}
          className="aspect-square object-contain fadeIn w-[118px] h-[118px] lg:w-[176px] lg:h-[176px]"
          alt={merchandise.title}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-1 justify-between gap-x-8">
          <div className="flex flex-col gap-2">
            {/* product title */}
            <Heading
              as="h3"
              className="text-base lg:text-lg font-bold line-clamp-2"
            >
              {merchandise?.product?.handle ? (
                <Link to={`/${category}/${merchandise.product.handle}`}>
                  {merchandise?.product?.title || ''}
                </Link>
              ) : (
                <Text>{merchandise?.product?.title || ''}</Text>
              )}
            </Heading>
            {/* product subtitles */}
            <div className="flex divide-x gap-2">
              <BodyText level="subtitle-2" className="!text-xs !lg-text-sm">
                Part #
                <span className="uppercase">{merchandise?.product.handle}</span>
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
            {/* In stock indicator */}
            <div className="flex items-center gap-1">
              <IconStockIndicator
                className={
                  merchandise?.availableForSale ? 'text-success' : 'text-error'
                }
              />
              <BodyText level="subtitle-2">
                {merchandise?.availableForSale ? 'In Stock' : 'Out of Stock'}
              </BodyText>
            </div>
            {/* Variants */}
            {/* <div className="grid pb-2">
              {(merchandise?.selectedOptions || []).map((option) => (
                <Text key={option.name}>
                  <span className="font-semibold">{option.name}:</span>{' '}
                  {option.value}
                </Text>
              ))}
            </div> */}
            {/* Prop65 Warning */}
            {merchandise?.product?.tags?.includes('prop65') && (
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
          {/* Price & Compare at Price */}
          <div className="flex flex-col items-end">
            <Text className="!text-2xl font-bold">
              <CartLinePrice line={line} as="span" />
            </Text>
            {line.cost?.compareAtAmountPerQuantity && (
              // had to calculate this :(
              <Text className="line-through text-xs whitespace-nowrap text-neutral-44">
                Was{' '}
                <Money
                  as="span"
                  withoutTrailingZeros
                  data={totalCompareAtCost}
                />
              </Text>
            )}
          </div>
        </div>
        {/* Cart Line Footer */}
        <div className="flex flex-1 justify-between items-center gap-4 flex-wrap">
          <div className="flex justify-start text-copy">
            <CartLineQuantityAdjust line={line} />
          </div>
          <div className="flex items-center divide-x">
            {/* <Text className="font-bold pr-3">Save For Later</Text> */}
            <CartEditPopUp
              isOpen={IsOpen}
              setIsOpen={setIsOpen}
              handle={merchandise.product?.handle}
              lineID={lineIds}
              merchandiseVariant={merchandise}
            />
            <button
              className="font-bold px-3"
              onClick={() => setIsOpen(true)}
            >
              Edit
            </button>
            <ItemRemoveButton lineIds={[id]}>
              <Text className="font-bold pl-3 ">Remove</Text>
            </ItemRemoveButton>
          </div>
        </div>
      </div>
    </li>
  );
}

export function ItemRemoveButton({
  lineIds,
  children,
}: {
  lineIds: CartLine['id'][];
  children: React.ReactNode;
}) {
  const fetcher = useFetcher();
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{
        lineIds,
      }}
    >
      {/* <input type="hidden" name="action" value={CartAction.REMOVE_FROM_CART} />
      <input type="hidden" name="linesIds" value={JSON.stringify(lineIds)} /> */}
      <button type="submit">{children}</button>
    </CartForm>
  );
}

function CartLineQuantityAdjust({ line }: { line: CartLine }) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const { id: lineId, quantity } = line;
  const QtyAdjustButtonClasses =
    'h-12 w-12 flex items-center justify-center text-neutral-8 border rounded-full border-neutral-8 disabled:opacity-50 disabled:cursor-not-allowed';

  const metafields = parseMetafields(line.merchandise.product.metafields);
  const minQuantity = Number(metafields?.minimumQuantity) || 1;
  const maxQuantity = Number(line?.merchandise?.quantityAvailable);
  const quantityInterval = Number(metafields?.quantityInterval) || 1;
  const prevQuantity = Math.max(minQuantity, quantity - quantityInterval);
  const nextQuantity = Math.min(maxQuantity, quantity + quantityInterval);

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {quantity}
      </label>
      <div className="flex items-center gap-1.5">
        <UpdateCartButton lines={[{ id: lineId, quantity: prevQuantity }]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className={QtyAdjustButtonClasses}
            value={prevQuantity}
            disabled={quantity <= minQuantity}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div
          className="h-12 w-12 flex justify-center items-center border rounded"
          data-test="item-quantity"
        >
          {quantity}
        </div>

        <UpdateCartButton lines={[{ id: lineId, quantity: nextQuantity }]}>
          <button
            className={QtyAdjustButtonClasses}
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
            disabled={quantity >= maxQuantity}
          >
            <span>&#43;</span>
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({ children, lines, }: { children: React.ReactNode; lines: CartLineUpdateInput[]; }) {
  const fetcher = useFetcher();

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines,
      }}
    >
      {children}
    </CartForm>
  );

}

export function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  const moneyObject = useMoney(line?.cost?.totalAmount || null);
  const [priceDollars, priceCents] = line?.cost?.totalAmount.amount!.split(
    '.',
  ) || ['0', '00'];

  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const parsedMetafields = parseMetafields(line.merchandise.product.metafields!);

  return (
    <div className='w-24'>
      <div className="flex">
        <HeaderText level="3" className="!mb-0">
          <div>
            {moneyObject.currencySymbol}
            {priceDollars}
          </div>
        </HeaderText>
        <HeaderText level="6" className="!mb-0 pt-[3.5px]">
          .{priceCents.length < 2 ? `${priceCents}0` : priceCents}
        </HeaderText>
      </div>
      {
        parsedMetafields?.unit_of_measure
          ?
          <p className='ml-2.5 text-lg text-black/75 font-bold'>{parsedMetafields?.unit_of_measure}</p>
          :
          <p className='ml-2.5 text-lg text-black/75 font-bold'>each</p>
      }
    </div>
  );
}

export function CartEmpty({
  layout = 'drawer',
  onClose,
}: {
  layout?: Layouts;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);

  const container = {
    drawer: clsx([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      `content-wrapper pb-12 md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <>
      <div ref={scrollRef} className={container[layout]}>
        {layout === 'page' && <CartPageHeader cartQuantity={0} />}
        <section className="bg-neutral-98 rounded-3xl flex flex-col items-center justify-center gap-y-8 !py-32">
          <Heading className="text-center !leading-9 !text-[28px] lg:!leading-10 lg:!text-4xl !font-extrabold">
            Your cart is empty.
          </Heading>
          <Link to="/search">
            <Button>Start Shopping</Button>
          </Link>
        </section>
      </div>
      {layout === 'page' && (
        <div className="content-wrapper !border-t py-6 md:py-8 lg:py-12">
          <RecentlyViewedProducts
            count={3}
            heading="Recently Viewed Products"
          />
        </div>
      )}
    </>
  );
}
