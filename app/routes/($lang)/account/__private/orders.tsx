import { useLoaderData } from '@remix-run/react';
import { Link } from '~/components';
import { TextLink } from '~/components/Link';
import { ORDER_PAGE_SIZE } from '~/lib/const';
import {
  AppLoadContext,
  LoaderArgs,
  defer,
  redirect,
} from '@shopify/remix-oxygen';
import { Customer } from '@shopify/hydrogen/storefront-api-types';
import { doLogout } from './logout';
import { useState } from 'react';

export const handle = {
  seo: {
    title: 'My Orders | Square Peg',
  },
};

// @ts-ignore
type TmpRemixFix = ReturnType<typeof loader>;

export async function loader({ request, context, params }: LoaderArgs) {
  const { language, country } = context.storefront.i18n;
  const lang = params.lang;
  const customerAccessToken = await context.session.get('customerAccessToken');
  const isAuthenticated = Boolean(customerAccessToken);
  const loginPath = lang ? `/${lang}/account/login` : '/account/login';

  if (!isAuthenticated) {
    return redirect(loginPath) as unknown as TmpRemixFix;
  }

  const url = new URL(request.url);
  const after = url.searchParams.get('after');
  const before = url.searchParams.get('before');

  const customer = await getCustomer(
    before,
    after,
    context,
    customerAccessToken,
  );

  return defer({
    isAuthenticated,
    customer,
    language,
    country,
  }) as unknown as TmpRemixFix;
}


export default function OrdersPage() {

  // Main data from API
  const data = useLoaderData<typeof loader>();

  // Filter data
  const prodData = data.customer.orders.nodes;

  const [showedAddress, setShowedAddress] = useState()
  const [currentPage, SetCurrentPage] = useState(1)

  const recordsPerPage = 12
  const lastIndex = currentPage * recordsPerPage
  const firstIndex = lastIndex - recordsPerPage
  const records = prodData.slice(firstIndex, lastIndex)
  const npage = Math.ceil(prodData.length / recordsPerPage)
  const pageNumbers = [...Array(npage + 1).keys()].slice(1)

  let recordLength = prodData.length;

  // Function to show or hide the full address
  function showFullAddress(id) {
    if (showedAddress !== id) {

      setShowedAddress(id)

    } else {

      setShowedAddress(null)

    }
  }

  // Function to change the current page
  function changeCurrentPage(id) {
    SetCurrentPage(id)
  }

  // Function for previous page
  function prevPage() {
    if (currentPage !== 1) {
      SetCurrentPage(currentPage - 1)
    }
  }

  // Function for next page
  function nextPage() {
    if (currentPage !== npage) {
      SetCurrentPage(currentPage + 1)
    }
  }

  // Sort by functionality
  const [showSortBy, setShowSortBy] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("new")

  const sortbyFilters = [
    {
      key: "old",
      value: "Oldest to Newest"
    },
    {
      key: "new",
      value: "Newest to Oldest"
    },
  ]

  let ordersAfterFilter = []

  if (recordLength > 0) {

    ordersAfterFilter = [...records];

    if (selectedSortBy == "old") {

      ordersAfterFilter.sort((a, b) => {

        const orderA = a.orderNumber || 0;
        const orderB = b.orderNumber || 0;
        return orderA - orderB;

      });

    } else if (selectedSortBy == "new") {

      ordersAfterFilter.sort((b, a) => {

        const orderA = a.orderNumber || 0;
        const orderB = b.orderNumber || 0;
        return orderA - orderB;

      });
    }
  }

  const [responsiveSidebar, setResponsiveSidebar] = useState(false)

  console.log("All order data in orderpage", ordersAfterFilter)

  return (
    <>
      <div className='content-wrapper'>

        {/* Breadcrumbs start */}
        <ol className="sm-max:pb-5 py-4 rounded flex text-sm pt-9">
          <li className="px-2 pl-0"><Link to="/account" className="no-underline font-bold">Account</Link></li>
          <li>/</li>
          <li className="px-2 font-normal">My Orders</li>
        </ol>
        {/* Breadcrumbs end */}

        <div className='w-full sm:flex sm:justify-start'>
          <div className="w-[calc(100%_+_20px)] sm:w-[270px] sm-max:w-full sm:pt-24 sm:pr-7 bg-white commonrightbg sm:pb-14">
            <div className='sm:py-0'>
              {/* my account start */}
              <div className="flex justify-start items-center sm:pb-32">
                <div className=" w-16 h-16 sm:flex-shrink-0 rounded-full bg-neutral-92 flex justify-center items-center">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.88824 27.3337C2.27713 27.3337 1.75398 27.1161 1.31879 26.6809C0.883608 26.2457 0.666016 25.7225 0.666016 25.1114V5.51884C0.666016 5.27484 0.703053 5.03955 0.777127 4.81295C0.851201 4.58639 0.962312 4.37724 1.11046 4.18551L3.03639 1.55588C3.23392 1.28428 3.49245 1.06823 3.81198 0.907733C4.13151 0.747239 4.46557 0.666992 4.81416 0.666992H23.1475C23.4961 0.666992 23.8302 0.747239 24.1497 0.907733C24.4692 1.06823 24.7277 1.28428 24.9253 1.55588L26.8882 4.18551C27.0364 4.37724 27.1475 4.58639 27.2216 4.81295C27.2956 5.03955 27.3327 5.27484 27.3327 5.51884V25.1114C27.3327 25.7225 27.1151 26.2457 26.6799 26.6809C26.2447 27.1161 25.7216 27.3337 25.1105 27.3337H2.88824ZM3.51787 4.59292H24.4438L23.0953 2.88921H4.8512L3.51787 4.59292ZM19.9253 6.81514H8.07342V19.4818L13.9993 16.5188L19.9253 19.4818V6.81514Z" fill="#160E1B" />
                  </svg>
                </div>
                <div className="text-[28px] sm:text-4xl text-black font-extrabold ml-4">
                  My Orders
                </div>
              </div>
              {/* my account end */}

            </div>

            {/* responsive sidemenu start */}
            <div className='relative cursor-pointer border border-neutral-8 rounded-3xl overflow-hidden mb-8 sm:hidden'>
              <p className='w-full flex justify-between items-center px-3.5 py-2.5 pr-1' onClick={() => setResponsiveSidebar(!responsiveSidebar)}>
                <b className='w-[90px] text-base'>Browse By:</b>
                <div className='flex justify-between items-center w-[calc(100%_-_90px)]'>
                  <b>Order History</b>
                  <svg className='mx-1.5' width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.825 0.158203L5 3.97487L1.175 0.158203L0 1.3332L5 6.3332L10 1.3332L8.825 0.158203Z" fill="#160E1B" transform={`${responsiveSidebar ? "rotate(180 5 2.5)" : ""}`} />
                  </svg>
                </div>
              </p>
              <ul className={`relative w-[98%] max-h-[122px] overflow-auto custom-scrollbarmenu ${responsiveSidebar == true ? "" : "hidden"}`}>

                <li className='block px-4 py-2 text-base activesidemenu'><Link to="/account/orders" className='block'> Order History</Link></li>


                <li
                  className='block px-4 py-2 text-base hover:bg-neutral-98 hover:font-semibold'

                >
                  <Link to="/account/Buy-it-again" className='block'> Buy It Again</Link>
                </li>

                <Link to="/pages/faq-page" className="flex items-center">
                  <li className="flex px-4 py-2 text-base hover:bg-neutral-98 hover:font-semibold">
                    <span className="mr-2">FAQs</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.47306 0.833984V2.11604H6.97947L0.832031 8.26347L1.73588 9.16732L7.88331 3.01988V8.52629H9.16537V0.833984H1.47306Z"
                        fill="#160E1B"
                      />
                    </svg>
                  </li>
                </Link>
              </ul>
            </div>
            {/* responsive sidemenu end */}

            {/* side menu start */}
            <div className='hidden sm:block'>

              <ul className=" space-y-2 mb-4 sidemenuactive">
                <li
                  className='font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold active'

                >
                  <Link to="/account/orders" className="block">
                    Order History
                  </Link>
                </li>

                <li
                  className='font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold'

                >
                  <Link to="/account/Buy-it-again" className="block">
                    Buy It Again
                  </Link>
                </li>

                <li className="font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold flex justify-start items-center">
                  <Link to="/pages/faq-page" className="flex items-center">
                    <span className="mr-2">FAQs</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.47306 0.833984V2.11604H6.97947L0.832031 8.26347L1.73588 9.16732L7.88331 3.01988V8.52629H9.16537V0.833984H1.47306Z"
                        fill="#160E1B"
                      />
                    </svg>
                  </Link>
                </li>
              </ul>

            </div>
            {/* side menu end */}

          </div>
          {/* right side sec start */}
          <div className='w-full sm:w-[calc(100%_-_270px)] sm:pt-24'>
            <div className='pb-8 sm:pb-0 sm:pt-0 sm:pl-[70px]'>
              <div className='border-b border-neutral-80 sm:pb-20'>
                <h3 className='text-xl sm:text-2xl font-extrabold text-neutral-8 sm:pb-5'>Order History ({prodData.length})</h3>
                {/* <p className='sm-max:py-6 text-base sm:text-lg font-normal'>Order details are split per shipment of your order. View all your orders through search and <br className='hidden sm:block' /> filter by order statuses.</p> */}
              </div>
              <div className='py-5 sm:flex sm:justify-between sm:py-9'>
                <div>&nbsp;</div>
                {/* Sort by */}
                {
                  ordersAfterFilter.length > 0 &&
                  <div className='relative cursor-pointer'>
                    <p onClick={() => setShowSortBy(!showSortBy)} className='w-auto flex sm-max:justify-start justify-between items-center'><b className='px-1.5'>Sort by:</b> {sortbyFilters.find(item => item?.key === selectedSortBy).value}
                      <svg className='mx-1.5' width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0L5 5L10 0H0Z" fill="#160E1B" transform={`${showSortBy ? "rotate(180 5 2.5)" : ""}`} />
                      </svg></p>
                    <ul className={`shadow absolute rounded sm-max:left-0 right-0 top-full w-44  ${showSortBy ? "" : "hidden"} bg-white`}>
                      {sortbyFilters?.map((item) => {
                        return (
                          <li className='block px-4 py-2 text-base hover:bg-neutral-98' key={item.key} onClick={() => {
                            setSelectedSortBy(item.key);
                            setShowSortBy(false)
                          }}>{item?.value}</li>
                        )
                      })}
                    </ul>
                  </div>
                }
                {/* Sort by */}
              </div>
              <div className="rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className='bg-neutral-8'>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-base font-bold text-white sm:w-[17%]">
                        Date
                      </th>
                      <th className="hidden px-3 py-3.5 text-left text-base font-bold text-white lg:table-cell lg:w-[19%]">
                        Order No.
                      </th>
                      <th className="hidden px-3 py-3.5 text-left text-base font-bold text-white lg:table-cell lg:w-[24%]">
                        Shipped To
                      </th>
                      <th className="px-3 py-3.5 text-left text-base font-bold text-white lg:table-cell lg:w-[15%]">
                        Total
                      </th>
                      <th className="hidden px-3 py-3.5 text-left text-base font-bold text-white lg:table-cell lg:w-[19%]">
                        Tracking No.
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:w-[6%]">
                        <span className="sr-only">Select</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className='rowColor'>
                    {
                      ordersAfterFilter.map((prod, k) => {

                        const [APIid, key] = prod.id.split('/').pop()!.split('?')

                        return (
                          <tr key={k}>
                            <td
                              className='relative py-4 pl-4 pr-3 whitespace-nowrap align-top'>
                              <div className="text-sm sm:text-base text-neutral-8">
                                <span className="">{new Date(prod.processedAt!).toLocaleDateString('en-US', { year: "numeric", day: "numeric", month: "long" })}
                                </span>
                              </div>
                            </td>
                            <td className="hidden whitespace-nowrap px-3 py-4 text-sm sm:text-base text-neutral-8 align-top lg:table-cell">
                              <div className="font-medium text-gray-900">
                                <span className="">{prod.orderNumber}</span>
                              </div>
                            </td>
                            <td className="hidden px-3 py-4 text-sm sm:text-base text-neutral-8 lg:table-cell align-top w-32 transition-all expentd">
                              <div className="font-medium text-gray-900 flex">
                                <span className="whitespace-nowrap">{prod?.shippingAddress?.firstName} {prod?.shippingAddress?.lastName}</span><span><svg onClick={() => showFullAddress(k)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`cursor-pointer arrowroted ${showedAddress === k ? "-rotate-180" : ""}${prod.shippingAddress ? "" : "hidden"}`}><g id="dropdown"><path id="drop-down" d="M7 10L12 15L17 10H7Z" fill="#160E1B"></path></g></svg></span>
                              </div>
                              <span className={`address transition-opacity duration-300 ${showedAddress === k ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                {prod?.shippingAddress?.address1},
                                {prod?.shippingAddress?.address2},
                                {prod?.shippingAddress?.city},
                                {prod?.shippingAddress?.country},
                                {prod?.shippingAddress?.zip}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm sm:text-base text-neutral-8 align-top">
                              <div className="font-medium text-gray-900">
                                <span className="ml-1">${prod.currentTotalPrice.amount}</span>
                              </div>
                            </td>
                            <td className="hidden whitespace-nowrap px-3 py-4 text-sm sm:text-base text-neutral-8 lg:table-cell align-top">
                              <div className="font-medium text-gray-900">
                                <span className="">{prod?.successfulFulfillments[0]?.trackingInfo[0]?.number ? prod?.successfulFulfillments[0]?.trackingInfo[0]?.number : "Order is not fulfilled"}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm sm:text-base text-neutral-8 lg:table-cell align-middle">
                              <TextLink to={`/account/orders/${APIid}?${key}`}>
                                <div className="font-medium text-gray-900">
                                  <svg width="6" height="8" className="cursor-pointer ml-5 sm-max:ml-8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.66656 0L0.726562 0.94L3.7799 4L0.726562 7.06L1.66656 8L5.66656 4L1.66656 0Z" fill="#160E1B" />
                                  </svg>
                                </div>
                              </TextLink>

                            </td>
                          </tr>
                        )

                      })
                    }
                  </tbody>
                </table>
              </div>
              <div className='pt-20 pb-36 flex justify-center items-center w-full'>
                <nav className={`isolate inline-flex space-x-1 ${recordLength <= recordsPerPage ? "hidden" : ""}`}>
                  <a
                    href="javascript:void(0)"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 "
                    onClick={prevPage}
                  >
                    <span className="sr-only">Previous</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#160E1B" />
                    </svg>
                  </a>
                  {
                    pageNumbers.map((n, i) => (

                      <a
                        key={i}
                        href="javascript:void(0)"
                        aria-current="page"
                        className={`relative z-10 items-center ${currentPage === n ? "bg-green-30 text-white" : "bg-white text-neutral-8"} w-10 h-10 flex-shrink-0 rounded-full text-center inline-grid text-base font-bold`}
                        onClick={() => changeCurrentPage(n)}
                      >
                        {n}
                      </a>

                    ))
                  }


                  <a
                    href="javascript:void(0)"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 "
                    onClick={nextPage}
                  >
                    <span className="sr-only">Previous</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.99984 6L8.58984 7.41L13.1698 12L8.58984 16.59L9.99984 18L15.9998 12L9.99984 6Z" fill="#160E1B" />
                    </svg>
                  </a>
                </nav>
              </div>

            </div>
          </div>
          {/* right side sec end */}
        </div>
      </div>
    </>
  );
}

export async function getCustomer(
  before: string,
  after: string,
  context: AppLoadContext,
  customerAccessToken: string,
) {
  const { storefront } = context;

  let variables;

  if (after) {
    variables = {
      first: ORDER_PAGE_SIZE,
      after,
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    };
  } else if (before) {
    variables = {
      last: ORDER_PAGE_SIZE,
      before,
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    };
  } else {
    variables = {
      first: ORDER_PAGE_SIZE,
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    };
  }

  const data = await storefront.query<{
    customer: Customer;
  }>(ORDERS_QUERY, {
    variables,
  });

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (!data || !data.customer) {
    throw await doLogout(context);
  }

  return data.customer;
}

const ORDERS_QUERY = `#graphql
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
query CustomerDetails($customerAccessToken: String!, $country: CountryCode, $language: LanguageCode, $first: Int, $last: Int, $after: String, $before: String) @inContext(country: $country, language: $language) {
  customer(customerAccessToken: $customerAccessToken) {
    orders(first: $first, last: $last, after: $after, before: $before, sortKey: PROCESSED_AT, reverse: true) {
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
      nodes {
        id
        orderNumber
        processedAt
        successfulFulfillments{
          trackingInfo{
            number
          }
        }
        shippingAddress {
          ...AddressFull
        }
        currentTotalPrice {
          amount
          currencyCode
        }
      }
    }
  }
}
`;
