import { useLoaderData } from '@remix-run/react';
import { IconSearchInput, Link, ProductCard } from '~/components';
import { ORDER_PAGE_SIZE } from '~/lib/const';
import {
    AppLoadContext,
    LoaderArgs,
    defer,
    redirect,
} from '@shopify/remix-oxygen';
import { Customer, Product, ProductConnection } from '@shopify/hydrogen/storefront-api-types';
import { doLogout } from './logout';
import { useRef, useState } from 'react';
import { PRODUCTS_QUERY } from '../../api/products';
import { METAFIELD_QUERY } from '~/data/fragments';

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


    let allProductId = []

    customer.orders.nodes.map((p, i) => {
        p.lineItems.nodes.map((pi, k) => {
            allProductId.push(parseInt(pi.variant.product.id.split("/")[4]))
        })
    });

    let allProducts = []

    customer.orders.nodes.map((p, i) => {
        p.lineItems.nodes.map((pi, k) => {
            allProducts.push(pi.variant.product)
        })
    });

    let uniqueProducts = [...new Set(allProductId)];
    const query = uniqueProducts.join(' OR ');

    const products = await context.storefront.query<{
        products: ProductConnection;
    }>(PRODUCTS_QUERY, {
        variables: {
            query,
            country: context.storefront.i18n.country,
            language: context.storefront.i18n.language,
            count: 50,
        },
        cache: context.storefront.CacheLong()
    });



    return defer({
        isAuthenticated,
        customer,
        allProducts,
        language,
        country,
        products,
        // prodDetails,
    }) as unknown as TmpRemixFix;
}


export default function OrdersPage() {

    // Main data from API
    const data = useLoaderData<typeof loader>();

    console.log("Main Order data for buyitagain", data)

    const prodData = []


    // data.customer.orders.nodes.map((p, i) => {
    //     p.lineItems.nodes.map((ps, k) => {
    //         prodData.push(ps)
    //     })
    // });

    // Filter data
    data?.products?.products?.nodes.map((p, i) => {
        prodData.push(p)
    })

    const [currentPage, SetCurrentPage] = useState(1)

    const recordsPerPage = 6
    const lastIndex = currentPage * recordsPerPage
    const firstIndex = lastIndex - recordsPerPage
    const records = prodData.slice(firstIndex, lastIndex)
    const npage = Math.ceil(prodData.length / recordsPerPage)
    const pageNumbers = [...Array(npage + 1).keys()].slice(1)



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

    let productsAfterFilter = []

    if (prodData.length > 0) {

        productsAfterFilter = [...records]

        if (selectedSortBy == "new") {

            productsAfterFilter.sort((a: { publishedAt: string }, b: { publishedAt: string }) => {
                return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
            });

        } else if (selectedSortBy == "old") {

            productsAfterFilter.sort((b: { publishedAt: string }, a: { publishedAt: string }) => {

                return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();

            });

        }

    }



    // items Search
    const [inputValue, setInputValue] = useState('');
    const myElementRef = useRef(null);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleInputKeyUp = (event) => {

        for (let i = 0; i < myElementRef.current.childNodes.length; i++) {

            let item = myElementRef.current.childNodes[i]
            let searchData = myElementRef.current.childNodes[i].childNodes[0].innerText.toLowerCase()

            if (searchData.indexOf(event.target.value.toLowerCase()) > -1) {

                item.style.display = ""

            } else {

                item.style.display = "none"

            }
        }

    }

    const [responsiveSidebar, setResponsiveSidebar] = useState(false)
    const [responsiveSort, setResponsiveSort] = useState(false)

    console.log("product details in buy again", data.allProducts)

    return (
        <>
            <div className='content-wrapper'>

                {/* Breadcrumbs start */}
                <ol className="sm-max:pb-5 py-4 rounded flex text-sm pt-9">
                    <li className="px-2 pl-0"><a href="#" className="no-underline font-bold">Account</a></li>
                    <li>/</li>
                    <li className="px-2 font-normal">My Orders</li>
                </ol>
                {/* Breadcrumbs end */}

                <div className='w-full sm:flex sm:justify-start'>
                    <div className="w-[calc(100%_+_20px)] sm-max:w-full sm:w-[270px]  sm:pt-24 sm:pr-7 bg-white commonrightbg sm:pb-14">
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
                                    <b>Buy It Again</b>
                                    <svg className='mx-1.5' width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.825 0.158203L5 3.97487L1.175 0.158203L0 1.3332L5 6.3332L10 1.3332L8.825 0.158203Z" fill="#160E1B" transform={`${responsiveSidebar ? "rotate(180 5 2.5)" : ""}`} />
                                    </svg>
                                </div>
                            </p>
                            <ul className={`relative w-[98%] max-h-[122px] overflow-auto custom-scrollbarmenu ${responsiveSidebar == true ? "" : "hidden"}`}>
                                <Link to="/account/orders">
                                    <li
                                        className='block px-4 py-2 text-base hover:bg-neutral-98 hover:font-semibold'

                                    >
                                        Order History
                                    </li>
                                </Link>
                                <Link to="/account/Buy-it-again">
                                    <li
                                        className='block px-4 py-2 text-base activesidemenu'

                                    >
                                        Buy It Again
                                    </li>
                                </Link>
                                <Link to="/pages/faq-page" className="flex items-center">
                                    <li className="block flex px-4 py-2 text-base hover:bg-neutral-98 hover:font-semibold">
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
                                    className='font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold'

                                >
                                    <Link to="/account/orders" className="block">
                                        Order History
                                    </Link>
                                </li>
                                <li
                                    className='font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold active'

                                >
                                    <Link to="/account/Buy-it-again" className="block">
                                        Buy It Again
                                    </Link>
                                </li>
                                <li className="font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold flex justify-start items-center">
                                    <Link to="/pages/faq-page"><span className="mr-3">FAQs</span></Link>
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
                            </ul>
                        </div>
                        {/* side menu end */}

                    </div>

                    {/* right side sec start */}
                    <div className='w-full sm:w-[calc(100%_-_270px)] sm:pt-24'>
                        <div className='pb-8 sm:pb-0 sm:pt-0 sm:pl-[70px]'>

                            <div className='border-b border-neutral-80 sm:pb-20'>
                                <h3 className='text-xl sm:text-2xl font-extrabold text-neutral-8 sm:pb-5'>{`Buy It Again (${prodData.length} Items)`}</h3>
                                <p className='sm-max:py-6 text-base sm:text-lg font-normal'>Search through all your past ordered items and easily buy it again.</p>
                            </div>

                            <div className='py-5 sm:flex sm:justify-between sm:py-9'>

                                {/* show hide filter start */}
                                <div className={`fixed w-full top-0 left-0 z-30 h-full bg-white ${responsiveSort == true ? '' : 'hidden'}`}>
                                    <div className=' bg-neutral-96 p-5 flex justify-between items-center'>
                                        <p className='text-lg text-neutral-8 font-semibold'>Filter & Sort</p>
                                        <svg onClick={() => setResponsiveSort(false)} width="40" height="40" className='cursor-pointer' viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="40" height="40" rx="20" fill="white" />
                                            <path d="M26.6673 14.508L25.4923 13.333L20.0007 18.8247L14.509 13.333L13.334 14.508L18.8257 19.9997L13.334 25.4913L14.509 26.6663L20.0007 21.1747L25.4923 26.6663L26.6673 25.4913L21.1757 19.9997L26.6673 14.508Z" fill="#160E1B" />
                                        </svg>
                                    </div>
                                    <div className='p-5 pb-0'>
                                        <div className='border-b border-neutral-88'>
                                            <div className='sm-max:block'>
                                                <div className="relative mb-5">
                                                    <div className="absolute left-[10px] -translate-y-[50%] top-[50%]">
                                                        <IconSearchInput />
                                                    </div>
                                                    <input
                                                        className="rounded border-neutral-80 py-3 focus:border-brand focus:ring-0 text-black w-full pl-[38px]"
                                                        type="text"
                                                        placeholder="Search items"
                                                        value={inputValue}
                                                        onChange={handleInputChange}
                                                        onKeyUp={handleInputKeyUp}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className=''>
                                        <p onClick={() => setShowSortBy(!showSortBy)} className='w-full flex justify-between items-center px-[30px] py-2.5'>
                                            <b className='w-[70px] text-base'>Sort By:</b>
                                            <div className='flex justify-between items-center w-[calc(100%_-_70px)]'>
                                                <b>{sortbyFilters.find(item => item?.key === selectedSortBy).value}</b>
                                                <svg className='mx-1.5' width="10" height={`${showSortBy == false ? '10' : '2'}`} viewBox={`0 0 10 ${showSortBy == false ? '10' : '2'}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d={`${showSortBy == false ? "M10 5.83333H5.83333V10H4.16667V5.83333H0V4.16667H4.16667V0H5.83333V4.16667H10V5.83333Z" : "M10 1.83366H0V0.166992H10V1.83366Z"}`} fill="#160E1B" />
                                                </svg>
                                            </div>
                                        </p>
                                        <div className={`px-5 py-2.5 ${showSortBy ? "" : "hidden"}`}>
                                            <ul className='space-y-1.5 border-b border-neutral-88 pb-2'>
                                                {sortbyFilters?.map((item) => {
                                                    return (

                                                        <li className={`block py-2 px-3 text-neutral-8 text-base hover:bg-neutral-98 hover:font-semibold ${item.key === selectedSortBy ? 'activebgpop' : ''}`} onClick={() => {
                                                            setSelectedSortBy(item.key);
                                                            setShowSortBy(false)
                                                            setResponsiveSort(false)
                                                        }}>
                                                            {item?.value}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className=' absolute left-0 bottom-12 bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-5 w-full'>
                                        <button className="inline-block rounded-full text-center sm-max:text-sm py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white w-full" type="button">
                                            <span className=" whitespace-pre-wrap inherit text-copy flex items-center justify-center gap-2">Show My Results</span>
                                        </button>
                                    </div>
                                </div>
                                {/* show hide filter end */}

                                {/* responsive btn search and filter sec start */}
                                <div className='sm:hidden'>
                                    <button onClick={() => setResponsiveSort(true)} className="inline-block rounded-full text-center py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white w-full mt-1" type="submit">
                                        <span className="max-w-prose whitespace-pre-wrap inherit text-copy flex items-center justify-center gap-2">Filter & Sort</span>
                                    </button>
                                    <p className='text-xs mt-2'>{prodData.length} Items</p>
                                </div>
                                {/* responsive btn search and filter sec end */}

                                {/* Search */}
                                <div className='hidden sm:block'>
                                    <div className="relative mb-8">
                                        <div className="absolute left-[10px] -translate-y-[50%] top-[50%]">
                                            <IconSearchInput />
                                        </div>
                                        <input
                                            className="rounded border-neutral-80 py-3 focus:border-brand focus:ring-0 text-black w-full pl-[38px]"
                                            type="text"
                                            placeholder="Search items"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            onKeyUp={handleInputKeyUp}
                                        />
                                    </div>
                                </div>
                                {/* Search */}

                                {/* Sort By */}
                                <div className='hidden sm:block'>
                                    <div className='relative cursor-pointer'>
                                        <p onClick={() => setShowSortBy(!showSortBy)} className='w-auto flex justify-between items-center'><b className='px-1.5'>Sort by:</b> {sortbyFilters.find(item => item?.key === selectedSortBy).value}
                                            <svg className='mx-1.5' width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M0 0L5 5L10 0H0Z" fill="#160E1B" transform={`${showSortBy ? "rotate(180 5 2.5)" : ""}`} />
                                            </svg></p>
                                        <ul className={`shadow absolute rounded right-0 top-full w-44 z-10  ${showSortBy ? "" : "hidden"} bg-white`}>
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
                                </div>
                                {/* Sort By */}

                            </div>

                            <div className="mt-4 sm:mt-10 grid grid-cols-2 gap-x-5 gap-y-5 sm:gap-x-8 sm:gap-y-8 sm:grid-cols-3" ref={myElementRef}>
                                {productsAfterFilter.map((product) => (

                                    <div>
                                        <div className='hidden'>{product.title}</div>
                                        <ProductCard
                                            product={product as Product}
                                            key={product.id}
                                            quickAdd
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className='py-14 sm:pt-20 sm:pb-36 flex justify-center items-center w-full'>
                                <nav className={`isolate inline-flex space-x-1 ${pageNumbers.length <= 1 ? "hidden" : ""}`}>
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

query CustomerOrder($customerAccessToken: String!, $country: CountryCode, $language: LanguageCode, $first: Int, $last: Int, $after: String, $before: String) @inContext(country: $country, language: $language) {
  customer(customerAccessToken: $customerAccessToken) {
    orders(first: $first, last: $last, after: $after, before: $before, sortKey: PROCESSED_AT, reverse: true) {
      nodes {
        id
        orderNumber
        processedAt
        shippingAddress {
          ...AddressFull
        }
        currentTotalPrice {
          amount
          currencyCode
        }
        lineItems(first: 100) {
            nodes {
              ...LineItemFull
            }
        }
      }
    }
  }
}
`;

export type FavoriteButtonProps = React.ComponentProps<'button'> & {
    product: Product;
    children?: React.ReactNode;
    variantId?: number;
};