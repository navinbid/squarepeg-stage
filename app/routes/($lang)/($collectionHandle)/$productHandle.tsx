import { type ReactNode, useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { Disclosure, Listbox, RadioGroup } from '@headlessui/react';
import {
  OkendoReviews,
  OkendoStarRating,
  WithOkendoStarRatingSnippet,
  WithOkendoReviewsSnippet,
  OKENDO_PRODUCT_STAR_RATING_FRAGMENT,
  OKENDO_PRODUCT_REVIEWS_FRAGMENT,
} from '@okendo/shopify-hydrogen';
import {
  ActionArgs,
  defer,
  json,
  redirect,
  type LoaderArgs,
  AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useTransition,
} from '@remix-run/react';
import {
  AnalyticsPageType,
  Money,
  ShopifyAnalyticsProduct,
  flattenConnection,
  type SeoHandleFunction,
  type SeoConfig,
  useMoney,
} from '@shopify/hydrogen';
import {
  Heading,
  IconCaret,
  IconCheck,
  ProductGallery,
  ProductSwimlane,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Input,
  IconMinus,
  IconPlus,
  IconStockIndicator,
  IconWarning,
} from '~/components';
import { getArrivalDate, getExcerpt } from '~/lib/utils';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  ProductVariant,
  SelectedOptionInput,
  Product as ProductType,
  Shop,
  ProductConnection,
  MediaConnection,
  MediaImage,
  Customer,
} from '@shopify/hydrogen/storefront-api-types';
import {
  MEDIA_FRAGMENT,
  METAFIELD_QUERY,
  PRODUCT_CARD_FRAGMENT,
} from '~/data/fragments';
import type { Storefront } from '~/lib/type';
import type { Product } from 'schema-dts';
import { getSwym } from '~/lib/swym';
import { getProductBySlug } from '~/lib/sanity';
import { HeaderText } from '~/components/HeaderText';
import { BodyText } from '~/components/BodyText';
import { PortableText } from '@portabletext/react';
import DiscoverMoreSection from '~/components/DiscoverMoreSection';
import { CustomBreadcrumbs } from '~/components/Breadcrumbs';
import { findDiscountForProduct } from '~/lib/shopify-admin.server';
import { MetafieldType, parseMetafields } from '~/lib/metafields';
import { ProductQuantitySection } from '~/components/ProductCard';
import OutOfStockModal from '~/components/OutOfStockModal';
import { getVariantsByUserProStatus } from '~/lib/product-variant';

declare global {
  interface Window {
    _learnq: any[];
  }
}

const seo: SeoHandleFunction<typeof loader> = ({ data }) => {
  // @ts-ignore
  const media = flattenConnection<MediaConnection>(data.product.media).find(
    (media) => media.mediaContentType === 'IMAGE',
  ) as MediaImage | undefined;

  const collectionName = data?.sanityProduct?.subcollection?.parentCollection?.title;

  const description =
    data?.product?.seo?.description ||
    data?.product?.seo?.title ||
    data?.product?.title;

  return {
    title: data?.product?.title,
    media: media?.image,

    // description: data?.product?.description,
    description: `Buy ${data?.product?.title} and other ${collectionName} supplies at SquarePeg.`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: data?.product?.vendor,
      name: data?.product?.title,
    },
  } satisfies SeoConfig<Product>;
};

export const handle = {
  seo,
};

export async function loader({ params, request, context }: LoaderArgs) {

  const { productHandle } = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');


  let searchParams;

  if (searchParams) {

    useEffect(() => {
      searchParams = new URL(request.url).searchParams;
    }, [])

  } else {

    searchParams = new URL(request.url).searchParams;

  }



  const selectedOptions: SelectedOptionInput[] = [];

  searchParams.forEach((value, name) => {
    selectedOptions.push({ name, value });
  });

  const { shop, product } = await context.storefront.query<{
    product: ProductType & {
      selectedVariant?: ProductVariant;
    } & WithOkendoStarRatingSnippet &
    WithOkendoReviewsSnippet;
    shop: Shop;
  }>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });


  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  const recommended = getRecommendedProducts(context.storefront, product?.id);

  // filter out pro or standard variants based on user pro status
  const filteredVariants = getVariantsByUserProStatus(product, context);
  // update product with filteredVariants
  product.variants.nodes = filteredVariants;


  // update product with filteredVariants
  product.variants.nodes = filteredVariants;

  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product?.id,
    variantGid: selectedVariant?.id,
    name: product?.title,
    variantName: selectedVariant?.title,
    brand: product?.vendor,
    price: selectedVariant?.price?.amount,
  };

  const sanityProduct = await getProductBySlug(productHandle);

  const productDiscount = await findDiscountForProduct(product?.id);

  const customerAccessToken = await context.session.get('customerAccessToken');
  let data;
  if (!customerAccessToken) {
    data = '';
  } else {
    const customer = await getCustomer(context, customerAccessToken);


    const idarr = customer.id.split('Customer/');

    const myHeaders = new Headers();
    myHeaders.append(
      'X-Shopify-Access-Token',
      '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',
    );
    myHeaders.append('Content-Type', 'application/json');

    const response = await fetch(
      'https://ecom-newbrand-dev.myshopify.com/admin/api/2022-07/customers/' +
      idarr[1] +
      '/metafields.json',
      {
        headers: myHeaders,
      },
    );

    data = await response.json();
  }
  const pid = product?.id.split('Product/')

  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');

  const productMfields = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/products/${pid[1]}/metafields.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.json())
    .then((result) => {
      return result;
    });

  return defer({
    sanityProduct,
    productDiscount,
    filteredVariants,
    productMfields,
    product,
    shop,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product?.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    data,
    searchParams,
  });
}

const wait = (amount = 0) =>
  new Promise((resolve) => setTimeout(resolve, amount));

export const action = async ({ request, context }: ActionArgs) => {
  const formData = await request.formData();
  const formName = formData.get('_action');
  await wait(3000);
  if (formName === 'notify_me') {
    getSwym(formData);
    return redirect(`/products/${formData.get('productUrl')}`);
  }

  if (formName === 'add_to_cart') {
    return json(
      { message: 'Hello World', productId: formData.get('productId') },
      { status: 200 },
    );
  }
};

export const DiscountDetails = ({
  minimumQuantity,
  standardPrice,
  discountAmount,
}: {
  minimumQuantity: number;
  standardPrice: number;
  discountAmount: Awaited<ReturnType<typeof findDiscountForProduct>>;
}) => {
  const discountedPrice = discountAmount?.flatDiscount
    ? standardPrice - discountAmount?.flatDiscount
    : (Number(standardPrice) * (1 - discountAmount?.amount)).toFixed(2);

  // console.log({ discountAmount });
  return (
    <div className="bg-lime-90 text-success py-[6px] px-2 text-xs rounded h-12 md:h-auto">
      Buy <span className="font-bold">{minimumQuantity} or more</span> for{' '}
      <span className="font-bold">${discountedPrice}/each</span>
    </div>
  );
};

export function ProductQuantityInput({
  itemQuantity,
  setItemQuantity,
  minimumQuantity,
  maxItemQuantity,
  quantityInterval,
  ...props
}) {
  const handleQuantityChange = (e: any) => {
    const { name } = e.target;
    let newQuantity = itemQuantity;
    if (name === 'increment') {
      newQuantity = itemQuantity + quantityInterval;
    } else if (name === 'decrement') {
      newQuantity = itemQuantity - quantityInterval;
    }

    setItemQuantity(
      Math.min(Math.max(minimumQuantity, newQuantity), maxItemQuantity),
    );
  };

  function validateQuantity(
    event: React.FocusEvent<HTMLInputElement, Element>,
  ) {
    // @ts-ignore
    const newValue = Number(event.target.value);

    if (Number.isNaN(newValue)) {
      return;
    }

    if (newValue <= minimumQuantity) {
      setItemQuantity(minimumQuantity);
    } else if (newValue % quantityInterval !== 0) {
      setItemQuantity(
        Math.floor(newValue / quantityInterval) * quantityInterval,
      );
    }
  }

  return (
    <div className="flex gap-2">
      <button
        name="decrement"
        className={quantityButtonStyles}
        onClick={handleQuantityChange}
        disabled={itemQuantity === 1 || itemQuantity === minimumQuantity}
      >
        <IconMinus className="pointer-events-none" />
        <div className="sr-only">Decrease Quantity</div>
      </button>
      <Input
        value={parseInt(itemQuantity)}
        min={1}
        max={maxItemQuantity}
        onChange={(e) => {
          // @ts-ignore
          const value = Number(e.target.value);

          if (!Number.isNaN(value) && value >= minimumQuantity) {
            setItemQuantity(value);
            return;
          }
        }}
        onBlur={(event) => validateQuantity(event)}
        className="max-w-[60px] text-center"
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
  );
}

export default function Product() {

  let { product, recommended, Shop, filteredVariants, sanityProduct, customerData, productMfields } = useLoaderData()

  // Breadcrumps
  const parentCollection = sanityProduct?.subcollection?.parentCollection;
  const subcollection = sanityProduct?.subcollection;

  const breadcrumbSegments = [
    {
      href: `/collections/${parentCollection?.slug?.current}`,
      text: parentCollection.title,
    },
    {
      href: `/collections/${parentCollection?.slug?.current}/${subcollection?.slug?.current}`,
      text: subcollection?.name,
    },
    {
      href: `/search?vendor=${sanityProduct?.store?.vendor}`,
      text: sanityProduct?.vendor,
    },
  ];

  // customer pro status filteration
  let proStatus

  if (customerData == "") {

    proStatus = 0

  } else {

    proStatus = customerData?.metafields[0]?.value

  }

  // Galary
  const { media } = product;

  // Product Details
  const { title, vendor, descriptionHtml } = sanityProduct;
  const manufacturerPartNumber = product?.metafields[3]?.value;

  // Selected Variant
  let [defaultVariant, setDefaultVariant] = useState(filteredVariants[0]);

  // Price Destructuring
  const [priceDollars, priceCents] = defaultVariant?.price?.amount.split(".")

  // Color filteration of variants
  let colorOptions = []

  filteredVariants.map((option) => {
    option.selectedOptions.filter((option) => option?.name == "Color").map((option) => {
      colorOptions.push(option.value || null)
    });
  })

  // Size filteration of variants
  let sizeOptions = []

  filteredVariants.map((option) => {
    option.selectedOptions.filter((option) => option?.name == "Size").map((option) => {
      sizeOptions.push(option.value || null)
    });
  })

  // Filter duplicate values
  let variantColors = colorOptions.filter((el, index) => colorOptions.indexOf(el) === index)

  // Filter duplicate values
  let variantSizes = sizeOptions.filter((el, index) => sizeOptions.indexOf(el) === index)

  // Setting up variant specification
  let [selectedColor, setSelectedColor] = useState(variantColors[0])
  let [selectedSize, setSelectedSize] = useState(variantSizes[0])

  // List box referance
  const closeRef = useRef<HTMLButtonElement>(null);

  // Setting the selected variant
  async function variantSelectColor(color) {
    setSelectedColor(color)
    let v = await filteredVariants.filter((variant) => variant?.selectedOptions[1]?.value === color && variant?.selectedOptions[2]?.value === selectedSize)
    setDefaultVariant(v[0])
  }

  async function variantSelectSize(size) {
    setSelectedSize(size)
    let v = await filteredVariants.filter((variant) => variant?.selectedOptions[1]?.value === selectedColor && variant?.selectedOptions[2]?.value === size)
    setDefaultVariant(v[0])
  }

  // Variant quantity set
  const parsedMetafields = parseMetafields(product.metafields!);

  const minimumQuantity = Number(parsedMetafields?.minimumQuantity) || 1;
  const quantityInterval = Number(parsedMetafields?.quantityInterval) || 1;

  const [itemQuantity, setItemQuantity] = useState<number | any>(
    Number(minimumQuantity) || 1,
  );
  const handleQuantityChange = (e: any) => {
    const { name } = e.target;
    let newQuantity = itemQuantity;
    if (name === 'increment') {
      newQuantity = itemQuantity + quantityInterval;
    } else if (name === 'decrement') {
      newQuantity = itemQuantity - quantityInterval;
    }

    setItemQuantity(
      Math.min(Math.max(minimumQuantity, newQuantity), defaultVariant.quantityAvailable),
    );
  };

  // Out of stock indication
  const isOutOfStock = !defaultVariant?.availableForSale || minimumQuantity > defaultVariant.quantityAvailable;

  // Product Description setup
  const docs_field = productMfields?.metafields.filter((meta) => meta.key == "docs_field") || null;
  const docs_title = productMfields?.metafields.filter((meta) => meta.key == "document_title") || null;
  const video_title = productMfields?.metafields.filter((meta) => meta.key == "videotitle") || null;
  const video_field = productMfields?.metafields.filter((meta) => meta.key == "video_link") || null;

  let docTitles
  let docField
  let videoTitle
  let videoField

  if (docs_title?.length != 0) {

    docTitles = JSON.parse(docs_title[0].value)

  }

  if (docs_field?.length != 0) {

    docField = JSON.parse(docs_field[0].value)

  }

  if (video_title?.length != 0) {

    videoTitle = JSON.parse(video_title[0].value)

  }

  if (video_field?.length != 0) {

    videoField = JSON.parse(video_field[0].value)

  }

  console.log("product data:", product)

  setRecentlyView(product)
  setLearnQ(product, sanityProduct);
  return (

    <>

      {/* Main Product */}
      <div className='content-wrapper'>

        {/* Breadcrump start */}
        <div className="!pt-[26px] py-6 md:py-8 lg:py-12 text-sm">
          <CustomBreadcrumbs segments={breadcrumbSegments} />
        </div>
        {/* Breadcrump end */}

        <div className='px-0 !pt-0 py-6 md:py-8 lg:py-12'>
          <div className='grid items-start md:gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3'>
            <ProductGallery
              // @ts-ignore
              media={media.nodes}
              className="w-full lg:col-span-2 h-full"
              product={
                product as ProductType & { selectedVariant?: ProductVariant }
              }
              disableZoom={false}
            />
            <div className='sticky md:-mb-nav md:top-nav md:-translate-y-nav md:pt-nav hiddenScroll md:overflow-y-scroll'>
              <section className='flex flex-col w-full max-w-xl gap-3 md:max-w-sm'>
                <div className="grid gap-3">
                  {vendor && (
                    <div className="-mb-1">
                      <Link
                        to={`/search?vendor=${vendor}`}
                        className="font-extrabold leading-6 text-brand"
                      >
                        {vendor}
                      </Link>
                    </div>
                  )}
                  <HeaderText level="1" className="font-extrabold !mb-0">
                    {title}
                  </HeaderText>
                  <div className="flex divide-x gap-2 divide-neutral-72">
                    <BodyText level="subtitle-2">
                      Part #{product.handle}
                    </BodyText>
                    {Boolean(manufacturerPartNumber) && (
                      <BodyText level="subtitle-2" className="pl-2">
                        MFG #{manufacturerPartNumber}
                      </BodyText>
                    )}
                  </div>
                  {product?.okendoReviewsSnippet &&
                    product?.okendoStarRatingSnippet ? (
                    <OkendoStarRating
                      productId={product.id}
                      // @ts-ignore
                      okendoStarRatingSnippet={product.okendoStarRatingSnippet}
                    />
                  ) : (
                    <Text color="subtle">No reviews</Text>
                  )}
                </div>
                <ProductForm />
                <div className='grid gap-10'>
                  <div className='grid gap-3'>
                    <div className='flex gap-2'>
                      {/* Variant Price */}
                      {/* <div className='flex'>
                        <h2 className='font-extrabold text-[28px] md:text-4xl leading-[36px] md:leading-[44px] mb-[16px] md:mb-[24px] !mb-0'>${priceDollars}</h2>
                        <h5 className='font-extrabold text-sm md:text-base leading-[20px] md:leading-[24px] mb-[8px] !mb-0 pt-[3.5px]'>.{priceCents}</h5>
                      </div> */}
                      {/* Variant Price */}
                    </div>

                    {/* Pro Indication */}
                    {
                      proStatus == 0 &&
                      <div className="w-full h-7 px-2 py-1.5 bg-zinc-200 rounded justify-start items-center inline-flex">
                        <span className="text-neutral-8 text-xs font-normal font-['Albert Sans'] leading-none mr-1">Get Pro Pricing </span>
                        <span className="text-neutral-8 text-xs font-normal font-['Albert Sans'] underline leading-none"><a href="/pro">Become a Pro</a></span>
                      </div>

                    }
                    {/* Pro Indication */}

                    {/* Product Variant options start */}

                    {/* <div className='flex flex-col flex-wrap mb-2 gap-y-2 last:mb-0'>

                      <Heading as="legend" size="lead" className="min-w-[4rem] text-sm font-semibold text-neutral-8">
                        {
                          colorOptions.length != 0 && `Color :${" "}`
                        }
                        <span className='font-normal'>
                          {selectedColor}
                        </span>
                      </Heading>
                      <div className='flex flex-wrap items-baseline gap-4 mb-3'>
                        <div className='flex space-x-3 pl-1 relative w-full'>
                          {
                            variantColors?.map((option, key) => (

                              <RadioGroup className="cursor-pointer" key={key} onClick={() => variantSelectColor(option)}>
                                <RadioGroup.Option value={option} className={clsx('rounded-full', 'h-7 w-7', 'relative', 'inline-block')} style={{ backgroundColor: option }}>
                                  {({ active }) => (

                                    <span className={active || selectedColor == option ? clsx('h-9 w-9', 'absolute', '-left-1', '-top-1', 'border', 'border-[color:var(--Neutral-Gray-8,#160E1B)]', 'rounded-full', 'border-solid', 'inline-block') : ""}></span>

                                  )}

                                </RadioGroup.Option>
                              </RadioGroup>

                            ))
                          }
                        </div>
                      </div>
                      <Heading as="legend" size="lead" className="min-w-[4rem] text-sm font-semibold text-neutral-8">
                        {
                          sizeOptions.length != 0 && `Size :${" "}`
                        }
                        <span className='font-normal'>
                          {selectedSize}
                        </span>
                      </Heading>
                      <div className='flex flex-wrap items-baseline gap-4'>
                        <div className='relative w-full'>
                          {
                            sizeOptions.length != 0 &&
                            <Listbox>
                              {({ open }) => (
                                <>
                                  <Listbox.Button
                                    ref={closeRef}
                                    className={clsx(
                                      'flex items-center justify-between w-full py-3 px-4 border border-neutral-80 font-extrabold',
                                      open
                                        ? 'rounded-b md:rounded-t md:rounded-b-none'
                                        : 'rounded',
                                    )}
                                  >
                                    <span>
                                      {selectedSize}
                                    </span>
                                    <svg width="10" height="5" className={`transition ${open ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M0.833496 0.333496L5.00016 4.50016L9.16683 0.333496H0.833496Z" fill="#160E1B" />
                                    </svg>
                                  </Listbox.Button>
                                  <Listbox.Options
                                    className={clsx(
                                      'border-neutral-80 bg-contrast absolute bottom-12 z-30 h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                                      open ? 'max-h-48' : 'max-h-0',
                                    )}
                                  >
                                    {
                                      variantSizes?.map((option, key) => (
                                        <Listbox.Option
                                          key={key}
                                          value={option}
                                        >
                                          {({ active }) => (

                                            <span
                                              className={clsx(
                                                'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                                active && 'bg-primary/10',
                                              )}
                                              onClick={() => variantSelectSize(option)}
                                            >
                                              {option}
                                              {
                                                selectedSize == option && (
                                                  <span className="ml-2">
                                                    <IconCheck />
                                                  </span>
                                                )
                                              }
                                            </span>

                                          )}
                                        </Listbox.Option>
                                      ))
                                    }
                                  </Listbox.Options>
                                </>
                              )}
                            </Listbox>
                          }
                        </div>
                      </div>
                      {defaultVariant && !isOutOfStock && (
                        <div className='space-y-4'>
                          <div className="flex gap-2 mt-3 h-[54px]">
                            <button
                              name="decrement"
                              className={quantityButtonStyles}
                              onClick={handleQuantityChange}
                              disabled={itemQuantity === 1 || itemQuantity === minimumQuantity}
                            >
                              <IconMinus className="pointer-events-none" />
                              <div className="sr-only">Decrease Quantity</div>
                            </button>
                            <Input
                              value={parseInt(itemQuantity)}
                              min={1}
                              max={defaultVariant.quantityAvailable}
                              className="max-w-[60px] text-center"
                            />
                            <button
                              name="increment"
                              className={quantityButtonStyles}
                              onClick={handleQuantityChange}
                              disabled={itemQuantity === defaultVariant.quantityAvailable}
                            >
                              <IconPlus className="pointer-events-none !hover:text-red-500" />
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
                                  merchandiseId: defaultVariant.id,
                                  quantity: parseInt(itemQuantity),
                                },
                              ]}
                              product={{
                                title: product.title,
                                handle: product.handle,
                              }}
                              variant={isOutOfStock ? 'secondary' : 'primary'}
                              data-test="add-to-cart"
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
                        </div>
                      )}
                      {defaultVariant && isOutOfStock && (
                        <OutOfStockModal product={product} variant={defaultVariant?.id} />
                      )}
                      <div className="flex items-center gap-1">
                        <IconStockIndicator
                          className={isOutOfStock ? 'text-error' : 'text-success'}
                        />
                        <BodyText level="subtitle-2">
                          {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                        </BodyText>
                        {!isOutOfStock && (
                          <BodyText level="subtitle-2"> - Get it by  <strong>{getArrivalDate()}</strong></BodyText>
                        )}
                      </div>
                      <BodyText level="subtitle-2">
                        <Link className="underline" to="/pages/shipping-returns">
                          See Shipping Details
                        </Link>
                      </BodyText>
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
                    </div> */}

                    {/* Product Variant options end */}

                  </div>
                </div>
              </section>
            </div>
          </div>
          <div className="grid pt-20">
            {sanityProduct?.features && (
              <ProductDetail
                title="Features"
                // @ts-ignore
                content={<PortableText value={sanityProduct.features!} />}
              />
            )}
            {descriptionHtml && (
              <ProductDetail title="Description" content={descriptionHtml} />
            )}
            {sanityProduct?.filterValues?.length > 0 && (
              <ProductDetail
                title="Specification"
                content={sanityProduct?.filterValues?.map((filter) => {
                  if (!filter.value || !filter.name) return null;
                  return (
                    <div key={filter._key} className="flex gap-2">
                      <BodyText level="subtitle-2" className="font-bold">
                        {filter.name}:
                      </BodyText>
                      <BodyText level="subtitle-2">{filter.value}</BodyText>
                    </div>
                  );
                })}
              />
            )}

            {/* Product Documents start */}

            {
              (docs_field?.length != 0 || video_field?.length != 0) &&

              (
                <ProductDetail
                  title="Documents"
                  content={
                    <>
                      {docs_field && (
                        docTitles?.map((title, key) => {
                          return (
                            <>
                              <div className="sm-max:pt-2 space-y-5 sm:pt-2 sm:mb-4">
                                <Link to={docField[key] || ''} target="_blank" className="font-normal text-base text-neutral-8 gap-4 flex justify-start items-start">
                                  <svg width="20px" height="20px" className='flex-shrink-0' viewBox="-4 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25.6686 26.0962C25.1812 26.2401 24.4656 26.2563 23.6984 26.145C22.875 26.0256 22.0351 25.7739 21.2096 25.403C22.6817 25.1888 23.8237 25.2548 24.8005 25.6009C25.0319 25.6829 25.412 25.9021 25.6686 26.0962ZM17.4552 24.7459C17.3953 24.7622 17.3363 24.7776 17.2776 24.7939C16.8815 24.9017 16.4961 25.0069 16.1247 25.1005L15.6239 25.2275C14.6165 25.4824 13.5865 25.7428 12.5692 26.0529C12.9558 25.1206 13.315 24.178 13.6667 23.2564C13.9271 22.5742 14.193 21.8773 14.468 21.1894C14.6075 21.4198 14.7531 21.6503 14.9046 21.8814C15.5948 22.9326 16.4624 23.9045 17.4552 24.7459ZM14.8927 14.2326C14.958 15.383 14.7098 16.4897 14.3457 17.5514C13.8972 16.2386 13.6882 14.7889 14.2489 13.6185C14.3927 13.3185 14.5105 13.1581 14.5869 13.0744C14.7049 13.2566 14.8601 13.6642 14.8927 14.2326ZM9.63347 28.8054C9.38148 29.2562 9.12426 29.6782 8.86063 30.0767C8.22442 31.0355 7.18393 32.0621 6.64941 32.0621C6.59681 32.0621 6.53316 32.0536 6.44015 31.9554C6.38028 31.8926 6.37069 31.8476 6.37359 31.7862C6.39161 31.4337 6.85867 30.8059 7.53527 30.2238C8.14939 29.6957 8.84352 29.2262 9.63347 28.8054ZM27.3706 26.1461C27.2889 24.9719 25.3123 24.2186 25.2928 24.2116C24.5287 23.9407 23.6986 23.8091 22.7552 23.8091C21.7453 23.8091 20.6565 23.9552 19.2582 24.2819C18.014 23.3999 16.9392 22.2957 16.1362 21.0733C15.7816 20.5332 15.4628 19.9941 15.1849 19.4675C15.8633 17.8454 16.4742 16.1013 16.3632 14.1479C16.2737 12.5816 15.5674 11.5295 14.6069 11.5295C13.948 11.5295 13.3807 12.0175 12.9194 12.9813C12.0965 14.6987 12.3128 16.8962 13.562 19.5184C13.1121 20.5751 12.6941 21.6706 12.2895 22.7311C11.7861 24.0498 11.2674 25.4103 10.6828 26.7045C9.04334 27.3532 7.69648 28.1399 6.57402 29.1057C5.8387 29.7373 4.95223 30.7028 4.90163 31.7107C4.87693 32.1854 5.03969 32.6207 5.37044 32.9695C5.72183 33.3398 6.16329 33.5348 6.6487 33.5354C8.25189 33.5354 9.79489 31.3327 10.0876 30.8909C10.6767 30.0029 11.2281 29.0124 11.7684 27.8699C13.1292 27.3781 14.5794 27.011 15.985 26.6562L16.4884 26.5283C16.8668 26.4321 17.2601 26.3257 17.6635 26.2153C18.0904 26.0999 18.5296 25.9802 18.976 25.8665C20.4193 26.7844 21.9714 27.3831 23.4851 27.6028C24.7601 27.7883 25.8924 27.6807 26.6589 27.2811C27.3486 26.9219 27.3866 26.3676 27.3706 26.1461ZM30.4755 36.2428C30.4755 38.3932 28.5802 38.5258 28.1978 38.5301H3.74486C1.60224 38.5301 1.47322 36.6218 1.46913 36.2428L1.46884 3.75642C1.46884 1.6039 3.36763 1.4734 3.74457 1.46908H20.263L20.2718 1.4778V7.92396C20.2718 9.21763 21.0539 11.6669 24.0158 11.6669H30.4203L30.4753 11.7218L30.4755 36.2428ZM28.9572 10.1976H24.0169C21.8749 10.1976 21.7453 8.29969 21.7424 7.92417V2.95307L28.9572 10.1976ZM31.9447 36.2428V11.1157L21.7424 0.871022V0.823357H21.6936L20.8742 0H3.74491C2.44954 0 0 0.785336 0 3.75711V36.2435C0 37.5427 0.782956 40 3.74491 40H28.2001C29.4952 39.9997 31.9447 39.2143 31.9447 36.2428Z" fill="#EB5757" />
                                  </svg>
                                  <p className='flex-grow'>{title || ''}</p>
                                </Link>
                              </div>
                            </>
                          )
                        })
                      )}
                      {video_field && (
                        videoTitle?.map((video, key) => {

                          return (

                            <div className="sm-max:pt-2 space-y-5 sm:pt-2 sm:mb-4">
                              <Link to={videoField[key]} target="_blank" className="font-normal text-base text-neutral-8 gap-4 flex justify-start items-start">
                                <svg enableBackground="new 0 0 32 32" height="24px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="24px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M30,6h-0.887c-0.525,0-1.029,0.207-1.404,0.576L25,9.248V8c0-1.657-1.344-3-3-3H3  C1.346,5,0,6.345,0,8v6.972V24c0,1.656,1.343,3,3,3h19c1.656,0,3-1.344,3-3v-1.221l2.709,2.672c0.375,0.369,0.879,0.576,1.404,0.576  H30c1.104,0,2-0.895,2-2V8C32,6.895,31.104,6,30,6z M3,25c-0.552,0-1-0.449-1-1V8c0-0.553,0.447-1,1-1h19c0.551,0,1,0.448,1,1v16  c0,0.551-0.449,1-1,1H3z M30,24.027h-0.887H29l-4-4V20l-1-1v-6l5-5h0.113H30V24.027z" fill="#333333" id="video" /></svg>
                                <p className='flex-grow'>{video || ''}</p>
                              </Link>
                            </div>

                          )


                        })
                      )}

                    </>
                  }
                />
              )
            }
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-neutral-98">
        <div className="content-wrapper">
          <div className="!pt-32 !pb-36">
            <Heading>Customer Reviews</Heading>
            <OkendoReviews
              productId={product.id}
              // @ts-ignore
              okendoReviewsSnippet={product.okendoReviewsSnippet}
            />
          </div>
        </div>
      </div>

      {/* You may also like & Discover more */}
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <div className="mt-32">
              <ProductSwimlane title="You May Also Like" products={products} />
            </div>
          )}
        </Await>
      </Suspense>
      <DiscoverMoreSection
        title="Discover More from SquarePeg"
        body="Join our community to access more resources and the latest updates.
            Our mission is to provide you with the best solutions for your
            professional and personal projects."
        links={[
          { label: 'About Us', to: '/our-story' },
          { label: 'Our Resources', to: '/blogs' },
        ]}
      />
    </>

  )
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string | ReactNode;
  learnMore?: string;
}) {
  return (
    <Disclosure
      key={title}
      as="div"
      className="grid self-center w-full gap-2 border-b pb-9"
    >
      {({ open }) => (
        <>
          <Disclosure.Button className="text-left pt-9">
            <div className="flex justify-between items-center">
              <HeaderText level="3" as="h3" className="mb-0">
                {title}
              </HeaderText>
              {open ? <IconMinus /> : <IconPlus />}
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
            {typeof content === 'string' ? (
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              content
            )}
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function setLearnQ(product, sanityProduct) {

  let item: any;

  if (typeof window !== 'undefined' && window._learnq) {

    item = {
      Name: product.title,
      ProductID: product.id.substring(product.id.lastIndexOf('/') + 1),
      ImageURL: product.variants.nodes[0].image.url,
      Handle: product.handle,
      Brand: product.vendor,
      Price: product.variants.nodes[0].price.amount,
      Metadata: {
        Brand: product.vendor,
        Price: product.variants.nodes[0].unitPrice,
        CompareAtPrice: product.variants.nodes[0].compareAtPrice,
      },
      URL: '/' + sanityProduct?.subcollection?.parentCollection?.slug?.current + '/' + product.handle
    }

    window._learnq.push([
      'track',
      'Viewed Product',
      item,
    ]);

    console.log("For learn q", window._learnq)
    console.log("Product details for klaviyo:", item)
  }


}

function setRecentlyView(product) {

  // // Recently Viewed Product functionality
  const [data, setData] = useState([]);

  let viewedProducts = []

  useEffect(() => {
    const value = localStorage.getItem('recently_viewed');
    setData(JSON.parse(value))
  }, []);


  if (data?.length != 0) {

    if (data != null) {

      viewedProducts = data;

      if (viewedProducts?.length > 3) {
        viewedProducts.pop()
      }

      let duplicateIds = []

      viewedProducts.map((recentProduct) => {
        duplicateIds.push(recentProduct.id)
      })

      let index = duplicateIds.indexOf(product.id)

      if (index > -1) {
        viewedProducts.splice(index, 1);
      }

      viewedProducts.unshift(product)

      localStorage.setItem('recently_viewed', JSON.stringify(viewedProducts))

      console.log("Recently viewed has been set successfully", viewedProducts)

    } else {

      viewedProducts.unshift(product)

      localStorage.setItem('recently_viewed', JSON.stringify(viewedProducts))

    }


  }
}

export const quantityButtonStyles = 'p-4 text-neutral-8 border rounded-full border-neutral-8 group disabled:cursor-not-allowed h-full';

export function ProductForm() {
  const { product, analytics, productDiscount } = useLoaderData<typeof loader>();
  // @ts-ignore
  const parsedMetafields = parseMetafields(product.metafields!);

  const minimumQuantity = Number(parsedMetafields?.minimumQuantity) || 1;
  const quantityInterval = Number(parsedMetafields?.quantityInterval) || 1;

  const [itemQuantity, setItemQuantity] = useState<number | any>(
    Number(minimumQuantity) || 1,
  );

  const [currentSearchParams] = useSearchParams();
  const transition = useTransition();

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
  const maxItemQuantity = selectedVariant?.quantityAvailable;

  const isOutOfStock =
    !selectedVariant?.availableForSale || minimumQuantity > maxItemQuantity;

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

    setItemQuantity(
      Math.min(Math.max(minimumQuantity, newQuantity), maxItemQuantity),
    );
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
  const { data } = useLoaderData();
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
          </div>
          {/* Price per unit start */}
          {
            parsedMetafields?.unit_of_measure
              ?
              <p className='ml-2.5 text-lg text-black/75 font-bold !h-auto'>{parsedMetafields?.unit_of_measure}</p>
              :
              <p className='ml-2.5 text-lg text-black/75 font-bold'>each</p>
          }
          {/* Price per unit end */}
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
            // @ts-ignore
            discountAmount={productDiscount}
          />
        )}
        {/* <h1>hio</h1> */}
        {!(data && data.metafields && data.metafields[0] && data.metafields[0].value)
          ? (<div className="w-auto h-7 px-2 py-1.5 bg-zinc-200 rounded justify-start items-start inline-flex">
            <div><span className="text-neutral-900 text-xs font-normal font-['Albert Sans'] leading-none">Get Pro Pricing </span><span className="text-neutral-900 text-xs font-normal font-['Albert Sans'] underline leading-none"><a href="/pro">Become a Pro</a></span></div>
          </div>
          ) : ''}
        <ProductOptions
          // @ts-ignore
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
        />
        {selectedVariant && !isOutOfStock && (
          <div className="grid items-stretch gap-4">
            <ProductQuantityInput
              itemQuantity={itemQuantity}
              setItemQuantity={setItemQuantity}
              minimumQuantity={minimumQuantity}
              maxItemQuantity={maxItemQuantity}
              quantityInterval={quantityInterval}
            />
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
                  title: product.title,
                  handle: product.handle,
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
          {!isOutOfStock && (
            <BodyText level="subtitle-2"> - {getArrivalDate()}</BodyText>
          )}
        </div>
        {/* {isOutOfStock && (
          <>
            <SwymForm
            // productId={productId}
            // productUrl={productUrl}
            // productVariantId={productVariantId}
            />
            <div>
              <Form method="post">
                <input type="hidden" name="productId" value={productId} />
                <input
                  type="hidden"
                  name="productVariantId"
                  value={productVariantId}
                />
                <input type="hidden" name="productUrl" value={productUrl} />
                <div className="flex flex-col gap-1">
                  <Input type="email" name="email" placeholder="Enter Email" />
                  <Button type="submit" name="_action" value="notify_me">
                    Notify Me
                  </Button>
                </div>
              </Form>
            </div>
          </>
        )} */}

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

export function ProductOptions({
  options,
  searchParamsWithDefaults,
}: {
  options: ProductType['options'];
  searchParamsWithDefaults: URLSearchParams;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <>

    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    quantityAvailable
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${OKENDO_PRODUCT_STAR_RATING_FRAGMENT}
	${OKENDO_PRODUCT_REVIEWS_FRAGMENT}
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      totalInventory
      ${METAFIELD_QUERY}
      ...OkendoStarRatingSnippet
			...OkendoReviewsSnippet
      options {
        name
        values
      }
      tags
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      media(first: 10) {
        nodes {
          ...Media
        }
      }
      variants(first: 15) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<{
    recommended: ProductType[];
    additional: ProductConnection;
  }>(RECOMMENDED_PRODUCTS_QUERY, {
    variables: { productId, count: 12 },
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}

export const CUSTOMER_QUERY = `#graphql
query CustomerDetails($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id
  }
}
`;

export async function getCustomer(
  context: AppLoadContext,
  customerAccessToken: string,
) {
  const { storefront } = context;

  const data = await storefront.query<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    variables: {
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return data.customer;
}
