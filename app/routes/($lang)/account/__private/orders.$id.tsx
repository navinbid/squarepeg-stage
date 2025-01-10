import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {
  json,
  redirect,
  type MetaFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { Money, Image, flattenConnection, CartForm } from '@shopify/hydrogen';
import { statusMessage } from '~/lib/utils';
import type {
  Order,
  OrderLineItem,
  DiscountApplicationConnection,
  CartLine,
} from '@shopify/hydrogen/storefront-api-types';
import { Link, Heading, Text, AddToCartButton } from '~/components';
import ImageWithFallback from '~/components/ImageWithFallback';
import ReactToPrint from 'react-to-print';
import { useRef } from 'react';
import {
  MEDIA_FRAGMENT,
  METAFIELD_QUERY,
  PRODUCT_CARD_FRAGMENT,
} from '~/data/fragments';
import { parseMetafields } from '~/lib/metafields';

export const meta: MetaFunction = ({ data }) => ({
  title: `Order ${data?.order?.name}`,
});

export async function loader({ request, context, params }: LoaderArgs) {

  if (!params.id) {
    return redirect(params?.lang ? `${params.lang}/account` : '/account');
  }

  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');

  const checkoutDetails = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/orders/${params.id}.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });


  const paymentDetails = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/checkouts/1371f0a0ebc61253cc91555c58751075.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });
  const shipmentDetails = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/checkouts/1371f0a0ebc61253cc91555c58751075//shipping_rates.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  invariant(orderToken, 'Order token is required');

  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.lang ? `${params.lang}/account/login` : '/account/login',
    );
  }

  const orderId = `gid://shopify/Order/${params.id}?key=${orderToken}`;

  const data = await context.storefront.query<{ node: Order }>(
    CUSTOMER_ORDER_QUERY,
    { variables: { orderId } },
  );

  const order = data?.node;

  if (!order) {
    throw new Response('Order not found', { status: 404 });
  }

  const lineItems = flattenConnection(order.lineItems!) as Array<OrderLineItem>;

  const discountApplications = flattenConnection(
    order.discountApplications as DiscountApplicationConnection,
  );

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  let allProductId = []

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
    checkoutDetails,
    paymentDetails,
    shipmentDetails,
  });
}

export default function OrderRoute() {
  const { order, lineItems, discountValue, discountPercentage, checkoutDetails, paymentDetails } =
    useLoaderData<typeof loader>();

  // console.log("Order Checkout Details", JSON.parse(checkoutDetails))
  // console.log("All order details in Order page", useLoaderData())

  // Order details variables
  const orderDate = new Date(order?.processedAt!).toLocaleDateString('en-US', { year: "numeric", day: "numeric", month: "long" })
  const orderId = order?.orderNumber

  const firstName = order?.shippingAddress?.firstName
  const lastName = order?.shippingAddress?.lastName
  const shippingAddress = order?.shippingAddress?.address1
  const shippingName = order?.shippingAddress?.address2
  const city = order?.shippingAddress?.city
  const state = order?.shippingAddress?.province
  const zipCode = order?.shippingAddress?.zip
  const country = order?.shippingAddress?.country
  const statusUrl = order?.statusUrl
  const status = order?.fulfillmentStatus

  // Order payment details
  const orderItems = order?.lineItems?.nodes?.length
  const orderAmount = order?.subtotalPriceV2?.amount
  const taxAmount = order?.totalTaxV2?.amount
  const grandTotal = parseFloat(orderAmount) + parseFloat(taxAmount)

  console.log("Main Order:", order)

  let cartlines = []

  lineItems.map((product) => {

    cartlines.push({
      merchandiseId: product.variant.id,
      quantity: 1,
    })

  })

  const componentRef = useRef()

  // console.log("product details in cart details", lineItems)

  return (
    <div className='content-wrapper' ref={componentRef}>

      {/* Breadcrumbs start */}
      <ol className="py-4 rounded flex text-sm pt-9">
        <li className="px-2 pl-0"><a href="#" className="no-underline font-bold">Account</a></li>
        <li>/</li>
        <Link to="/account/orders/">
          <li className="px-2"><a className="no-underline font-bold">My Orders</a></li>
        </Link>
        <li>/</li>
        <li className="px-2 font-normal">Order Details</li>
      </ol>
      {/* Breadcrumbs end */}

      <div className='py-12'>
        <div className='bg-neutral-98 p-5 sm:p-10 sm:pt-8 rounded-2xl'>
          <div className='sm:flex sm:justify-between sm:items-start border-b border-neutral-80 pb-4'>
            <div className='text-neutral-8 sm-max:pb-4'>
              <h2 className='text-[28px] sm:text-4xl font-extrabold sm:pb-10 pb-3'>Order Details</h2>
              <p className='text-base font-normal'>Ordered on {orderDate}<span className=' text-neutral-88 px-3 sm-max:hidden'>|</span> <span className='sm-max:block'>Order # {orderId}</span></p>
            </div>
            <div className=' sm:flex flex-col sm:items-end'>
              <CartForm
                route="/cart"
                inputs={{
                  lines: cartlines
                }}
                action={CartForm.ACTIONS.LinesAdd}
              >
                <button className="inline-block rounded-full text-center text-base py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white sm:w-auto w-full">Reorder All</button>
              </CartForm>
              <ReactToPrint trigger={() => {

                return <button className='flex justify-start items-center mt-5'>
                  <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" className='mr-1'>
                    <path d="M12.7096 4.46973V1.71973H5.29297V4.46973H4.04297V0.469727H13.9596V4.46973H12.7096ZM14.3971 7.69889C14.5638 7.69889 14.7096 7.63639 14.8346 7.51139C14.9596 7.38639 15.0221 7.24056 15.0221 7.07389C15.0221 6.90723 14.9596 6.76139 14.8346 6.63639C14.7096 6.51139 14.5638 6.44889 14.3971 6.44889C14.2305 6.44889 14.0846 6.51139 13.9596 6.63639C13.8346 6.76139 13.7721 6.90723 13.7721 7.07389C13.7721 7.24056 13.8346 7.38639 13.9596 7.51139C14.0846 7.63639 14.2305 7.69889 14.3971 7.69889ZM12.7096 14.2197V10.2197H5.29297V14.2197H12.7096ZM13.9596 15.4697H4.04297V11.8031H0.667969V6.67806C0.667969 6.05237 0.879774 5.52789 1.30339 5.10462C1.727 4.68136 2.2513 4.46973 2.8763 4.46973H15.1263C15.752 4.46973 16.2765 4.68136 16.6997 5.10462C17.123 5.52789 17.3346 6.05237 17.3346 6.67806V11.8031H13.9596V15.4697ZM16.0846 10.5531V6.67358C16.0846 6.39879 15.9928 6.17112 15.8091 5.99056C15.6254 5.81 15.3978 5.71973 15.1263 5.71973H2.8763C2.60477 5.71973 2.37717 5.81157 2.19349 5.99525C2.00981 6.17893 1.91797 6.40653 1.91797 6.67806V10.5531H4.04297V8.96973H13.9596V10.5531H16.0846Z" fill="#160E1B" />
                  </svg>
                  <p className='text-base font-extrabold text-neutral-8'>View or Print Invoice</p>
                </button>

              }}

                content={() => componentRef.current}
                documentTitle={`Invoice`}
                pageStyle="print"
              />

            </div>
          </div>

          {/* Billing sec start */}
          <div className='pt-6 sm:pt-10 sm:flex sm:justify-between sm:items-start'>
            <div className='sm:flex sm:justify-start sm:items-start sm:w-[50%]'>
              <div className='sm:flex sm:justify-start sm:items-start sm:gap-40'>
                <div className='sm-max:pb-4'>
                  <h5 className='text-base font-extrabold text-neutral-8 sm:pb-3 pb-1'>Shipping Address</h5>
                  <div className='text-base font-normal text-neutral-8 leading-8'>
                    <p>{firstName} {lastName}</p>
                    <p>{shippingAddress}</p>
                    <p>{shippingName} {city}, {state} {zipCode}</p>
                    <p>{country}</p>
                  </div>
                </div>
                <div className='sm-max:pb-4'>
                  <h5 className='text-base font-extrabold text-neutral-8 sm:pb-3 pb-1'>Payment Method</h5>
                  <div className='text-base font-normal text-neutral-8 leading-8'>
                    <p><span className='font-extrabold'>VISA</span> ****0000</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='sm:w-[30%] w-full'>
              <ul className='space-y-2 border-b border-neutral-80 pb-4'>
                <li className='flex justify-between items-center text-base text-neutral-8'>
                  <span className='font-extrabold'>Item Subtotal ({orderItems})</span>
                  <span className='font-normal'>${orderAmount}</span>
                </li>
                <li className='flex justify-between items-center text-base text-neutral-8'>
                  <span className='font-extrabold'>Shipping</span>
                  <span className='font-normal'>$50.00</span>
                </li>
                <li className='flex justify-between items-center text-base text-neutral-8'>
                  <span className='font-extrabold'>Total Before Tax</span>
                  <span className='font-normal'>${orderAmount}</span>
                </li>
                <li className='flex justify-between items-center text-base text-neutral-8'>
                  <span className='font-extrabold'>Estimated Tax</span>
                  <span className='font-normal'>${taxAmount}</span>
                </li>
              </ul>
              <ul className='pt-3'>
                <li className='flex justify-between items-center text-neutral-8'>
                  <span className='font-extrabold sm:text-lg text-base'>Grand Total</span>
                  <span className='font-extrabold sm:text-2xl text-xl'>${grandTotal}</span>
                </li>
              </ul>
            </div>
          </div>
          {/* Billing sec end */}

        </div>
      </div>

      <div className='bg-neutral-98 px-4 py-3.5 rounded-t-2xl sm:flex sm:justify-between sm:items-center'>
        <div className='sm-max:pb-2.5'>
          <p className='text-base font-normal'><span className='text-success text-lg font-bold sm-max:block sm-max:pb-2.5'>{status}</span><span className=' text-neutral-88 px-3 sm-max:hidden'>|</span> <span>{orderItems} {`${orderItems > 1 ? "Items" : "Item"}`}</span><span className=' text-neutral-88 px-3'>|</span> <span>Total: ${grandTotal}</span> </p>
        </div>
        <a href={statusUrl}>
          <button className="flex justify-center items-center rounded-full text-center text-sm py-2 px-12 font-normal transition-colors bg-brand hover:bg-brand-hover text-white sm:w-auto w-full" type="button"><span>Track Package</span> <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="arrow"><path id="arrow-external" d="M5.83333 5V6.66667H12.9917L5 14.6583L6.175 15.8333L14.1667 7.84167V15H15.8333V5H5.83333Z" fill="currentColor" className='pl-1 mt-[3px]'></path></g></svg></button>
        </a>
      </div>
      <div className='mt-10 mb-24'>

        {/* @ts-ignore */}
        {lineItems.map((lineItem: OrderLineItem) => {
          if (!lineItem.variant) return null;

          const [type, color, size] = lineItem.variant.title.split('/')
          const parsedMetafields = parseMetafields(lineItem.variant.product.metafields)

          return (
            <>
              {/* add product sec start */}
              <div className='border-b border-gray-200 pb-10'>
                <div className="mt-10 grid grid-cols-1 gap-x-[2%] gap-y-4 sm:grid-cols-[20%_51%_25%] ">
                  <Link
                    to={`/product/${lineItem?.variant?.product?.handle}`}
                  >
                    <div className='sm:col-span-1 bg-neutral-96 p-4 min-h-40 rounded-lg justify-center flex items-center relative'>
                      <img src={lineItem?.variant?.image?.src} alt="OrderDetails" />
                    </div>
                  </Link>
                  <div className="">
                    <div className='sm:col-span-5'>
                      {/* <h2 className='text-lg font-bold text-success pb-2.5'>Processing Return</h2> */}
                      <h3 className='text-lg font-extrabold text-neutral-8 pb-1'>{lineItem?.title}</h3>
                      <p className='text-sm font-normal py-0.5 text-neutral-8'><span className='sm-max:block'>Part #{lineItem?.variant?.sku}</span><span className=' text-neutral-88 px-3 sm-max:hidden'>|</span> <span className='sm-max:block'>MFG #{lineItem?.variant?.product?.metafields[3]?.value}</span></p>
                      <div className='flex'>
                        <p className='text-sm font-normal py-0.5'><span className='sm-max:block text-xl font-extrabold'>${lineItem?.discountedTotalPrice?.amount}</span> <span className='sm-max:block text-xs line-through'>Was ${lineItem.originalTotalPrice.amount}</span></p>
                        {parsedMetafields?.unit_of_measure && <p className='ml-2.5 text-lg text-black/75 font-bold'>{parsedMetafields?.unit_of_measure}</p>}
                      </div>
                      {
                        color &&
                        <p className='text-sm font-normal py-0.5'><span className='text-sm font-semibold'>Color:</span> <span className='text-sm'>{color}</span></p>
                      }
                      {
                        size &&
                        <p className='text-sm font-normal py-0.5'><span className='text-sm font-semibold'>Size:</span> <span className='text-sm'>{size}</span></p>
                      }
                    </div>
                  </div>
                  <div className=" space-y-3 flex flex-col md:items-end pr-3">
                    {/* <button className="inline-flex justify-center items-center rounded-full text-center py-3 px-8 text-base font-extrabold transition-colors border-2 w-full border-brand bg-white text-brand hover:text-white hover:bg-brand">Cancel</button> */}
                    <AddToCartButton
                      lines={[
                        {
                          quantity: Number(lineItem.variant.product.metafields[0].value) || 1,
                          merchandiseId: lineItem.variant.id,
                        },
                      ]}
                      product={{
                        title: lineItem.title,
                        handle: lineItem.variant.product.handle,
                      }}
                      variant="primary"
                      className="inline-flex justify-center items-center rounded-full text-center py-1.5 px-8 text-sm font-semibold transition-colors border w-full md:w-[206px]  border-brand bg-white text-brand hover:text-white hover:bg-brand-hover"
                    >
                      <Text as="span" className="flex items-center justify-center gap-2">
                        Buy It Again
                      </Text>
                    </AddToCartButton>
                    {/* <button className="inline-flex justify-center items-center rounded-full text-center py-1.5 px-8 text-sm font-semibold transition-colors border w-full  border-brand bg-white text-brand hover:text-white hover:bg-brand-hover">Return or Replace</button>
                    <button className="inline-flex justify-center items-center rounded-full text-center py-1.5 px-8 text-sm font-semibold transition-colors border w-full  border-brand bg-white text-brand hover:text-white hover:bg-brand-hover">Write a Review</button> */}

                  </div>
                </div>
              </div>
              {/* add product sec end */}
            </>
          );
        })}

      </div>

    </div>
  );
}

const CUSTOMER_ORDER_QUERY = `#graphql
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      ... on MoneyV2 {
        amount
        currencyCode
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment Image on Image {
    altText
    height
    src: url(transform: {crop: CENTER, maxHeight: 96, maxWidth: 96, scale: 2})
    id
    width
  }
  fragment ProductVariant on ProductVariant {
    id
    image {
      ...Image
    }
    price {
      ...Money
    }
    product {
      id
      handle
      ${METAFIELD_QUERY}
    }
    sku
    title
  }
  fragment LineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...Money
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...Money
    }
    discountedTotalPrice {
      ...Money
    }
    variant {
      ...ProductVariant
    }
  }

  query CustomerOrder(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    node(id: $orderId) {
      ... on Order {
        id
        name
        orderNumber
        processedAt
        statusUrl
        fulfillmentStatus
        totalTaxV2 {
          ...Money
        }
        totalPriceV2 {
          ...Money
        }
        subtotalPriceV2 {
          ...Money
        }
        shippingAddress {
          ...AddressFull
        }
        discountApplications(first: 100) {
          nodes {
            ...DiscountApplication
          }
        }
        lineItems(first: 100) {
          nodes {
            ...LineItemFull
          }
        }
      }
    }
  }
`;