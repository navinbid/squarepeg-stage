import {
  Form,
  Outlet,
  useActionData,
  useLoaderData,
  useMatches,
  useNavigate,
  useOutlet,
} from '@remix-run/react';
import type {
  Customer,
  MailingAddress,
  Order,
} from '@shopify/hydrogen/storefront-api-types';

import { Suspense, useEffect, useRef, useState } from 'react';

import {
  Button,
  PageHeader,
  Text,
  AccountDetails,
  AccountAddressBook,
  Modal,
  Heading,
} from '~/components';

import { FeaturedCollections } from '~/components/FeaturedCollections';
import {
  json,
  defer,
  redirect,
  type LoaderArgs,
  type AppLoadContext,
  ActionFunction,
} from '@shopify/remix-oxygen';
import { Money, flattenConnection } from '@shopify/hydrogen';
import { getFeaturedData } from './featured-products';
import { doLogout } from './account/__private/logout';
import { usePrefixPathWithLocale } from '~/lib/utils';
import {
  ORDERS_SHOWN_ON_ACCOUNT,
  PUBLIC_ACCOUNTS_ROUTES_REGEX,
} from '~/lib/const';
import { Link, TextLink } from '~/components/Link';
import AccountSideBar from '~/components/AccountSideBar';
import DeletePopUP from '~/components/DeletePopUP';


export const handle = {
  seo: {
    title: 'My Account | Square Peg',
  },
};

// Combining json + Response + defer in a loader breaks the
// types returned by useLoaderData. This is a temporary fix.
type TmpRemixFix = ReturnType<typeof defer<{ isAuthenticated: false }>>;

export async function loader({ request, context, params }: LoaderArgs) {
  const { language, country } = context.storefront.i18n;
  const { pathname } = new URL(request.url);
  const lang = params.lang;
  const customerAccessToken = await context.session.get('customerAccessToken');
  const isAuthenticated = Boolean(customerAccessToken);
  const loginPath = lang ? `/${lang}/account/login` : '/account/login';

  if (!isAuthenticated) {
    if (PUBLIC_ACCOUNTS_ROUTES_REGEX.test(pathname)) {
      return json({ isAuthenticated }) as unknown as TmpRemixFix;
    }

    return redirect(loginPath) as unknown as TmpRemixFix;
  }

  const customer = await getCustomer(context, customerAccessToken);
  const idarr = customer.id.split('Customer/');
  const cid = idarr[1];
  context.session.set('cid', cid)
  const { session } = context;
  session.set('email', customer.email)

  const orders = flattenConnection(customer.orders) as Order[];

  return json({
    isAuthenticated,
    customer,
    orders,
    addresses: flattenConnection(customer.addresses) as MailingAddress[],
    featuredData: getFeaturedData(context.storefront),
    language,
    country,
  }) as unknown as TmpRemixFix;
}


export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();
  const Cid = formData.get('id')
  let id
  id = Cid;

  const idarr = id.split('Customer/');
  console.log(id);
  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');


  const storedata = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/` +
    idarr[1] +
    '.json',
    {
      method: 'DELETE',
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    })
    .catch((error) => console.log('error', error));

  return true;
}

export default function Authenticated() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderOutletInModal = matches.some((match) => {
    return match?.handle?.renderInModal;
  });

  // Public routes
  if (!data.isAuthenticated) {
    return <Outlet />;
  }

  // Authenticated routes
  if (outlet) {
    if (renderOutletInModal) {
      return (
        <>
          <Modal cancelLink="/account">
            <Outlet context={{ customer: data.customer }} />
          </Modal>
          {/* 
          // @ts-ignore */}
          <Account {...data} />
        </>
      );
    } else {
      return <Outlet context={{ customer: data.customer }} />;
    }
  }
  // @ts-ignore
  return <Account {...data} />;
}

interface Account {
  customer: Customer;
  orders: Order[];
  heading: string;
  addresses: MailingAddress[];
  featuredData: any; // @todo: help please
  totalCount: number;
}

function Account({
  customer,
  orders,
  totalCount,
  heading,
  addresses,
  featuredData,
}: Account) {
  const navigate = useNavigate();
  const activeNavValue = 'profile';

  useEffect(() => {
    sessionStorage.setItem('cid', customer.id);
  }, [customer.id]);

  console.log(customer);
  const [DeletePopUPOpen, setDeletePopUPOpen] = useState(false);
  const [deleteValue, setDeleteValue] = useState(false);
  const deleteFormRef = useRef(null);

  console.log(deleteValue);

  const handleDelete = () => {
    setDeletePopUPOpen(true);
  };

  useEffect(() => {
    if (deleteValue) {
      deleteFormRef.current.submit();
    }
  }, [deleteValue]);

  const formatPhoneNumber = (input) => {
    const cleanedNumber = input?.replace(/^(\+1|\+)/, '');

    // Remove non-numeric characters from the cleaned string
    const numericString = cleanedNumber?.replace(/\D/g, '');

    // Use regular expressions to format the numeric string
    const formattedNumber = numericString?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

    return formattedNumber;
  };

  const actinData = useActionData();
  console.log(actinData);

  return (
    <>
      <div className='bg-neutral-98'>
        <div className="content-wrapper">
          <div className="w-full sm:flex sm:justify-start">
            {/* side bar start */}
            <AccountSideBar activeNav={activeNavValue} />
            {/* side bar end */}
            {/* right side start */}
            <div className="w-full sm:w-[calc(100%_-_270px)] sm:pt-24 bg-neutral-98">
              <div className="pt-14 pb-8 sm:pb-0 sm:pt-0 sm:pl-32">
                <div className="flex justify-start items-center">
                  <h1 className="font-extrabold text-4xl text-neutral-8 mr-7">
                    Profile
                  </h1>
                </div>

                <div className="space-y-12">
                  <div className="pb-8">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-normal leading-6 text-neutral-8">
                          First Name<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={customer?.firstName}
                            name="first-name"
                            id="first-name"
                            autoComplete="given-name"
                            disabled
                            className="block w-full rounded-md border-0 py-3 text-neutral-44 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                          />
                          {/* when error we have to pass proerror class */}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                          Last Name<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                        </label>
                        <div className="mt-2">
                          <input
                            value={customer?.lastName}
                            type="text"
                            name="last-name"
                            id="last-name"
                            autoComplete="family-name"
                            disabled
                            className="block w-full rounded-md border-0 py-3 text-neutral-44 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-normal leading-6 text-neutral-8">
                          Email<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                        </label>
                        <div className="mt-2">
                          <input
                            value={customer?.email}
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            disabled
                            className="block w-full rounded-md border-0 py-3 text-neutral-44 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                          Phone Number<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                        </label>
                        <div className="mt-2">
                          <input
                            value={formatPhoneNumber(customer?.phone)}
                            type="text"
                            name="number"
                            id="number"
                            autoComplete="number"
                            disabled
                            className="block w-full rounded-md border-0 py-3 text-neutral-44 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pb-8 sm:pb-0 sm:flex sm:justify-between sm:items-center">
                  <div className='sm:space-x-3'>
                    <button
                      className="block w-full sm:inline-block rounded-full text-center py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white sm:w-auto mt-1"
                      onClick={() => window.location.href = '/account/edit'}
                    >
                      Edit Profile
                    </button>

                  </div>
                  <div className='flex justify-center items-center'>
                    {/* <Form action='' method='post'>
                      <input type="hidden" name="id" value={customer.id} />
                      <button className="inline-block text-center pt-3 pb-0.5 mx-4 font-extrabold transition-colors text-green-30 w-auto mt-1 border-b-2 border-[#b1bbad]">
                        Delete Account
                      </button>
                    </Form> */}
                    <Form action='' method='post' onSubmit={(e) => e.preventDefault()} ref={deleteFormRef}>
                      <input type="hidden" name="id" value={customer.id} />
                      <button
                        className="block sm:inline-block text-center pt-3 pb-0.5 sm:ml-4 font-extrabold transition-colors text-green-30 sm:w-auto mt-1 border-b-2 border-[#b1bbad] cursor-pointer"
                        onClick={handleDelete}
                      >
                        Delete Account
                      </button>
                    </Form>
                    <DeletePopUP
                      isOpen={DeletePopUPOpen}
                      setIsOpen={setDeletePopUPOpen}
                      setDelete={setDeleteValue}
                    />
                  </div>
                </div>

                <div className="px-4 py-2 sm:mt-60 sm:mb-16 w-full bg-neutral-96 rounded-md sm:px-2 sm:py-1.5 text-center font-normal text-sm text-neutral-8">
                  For more information about how we handle your data, please review
                  our{' '}
                  <span className=" text-green-30 underline cursor-pointer">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                  </span>
                  .
                </div>
              </div>
            </div>
            {/* right side end */}
          </div>
        </div>
      </div>
    </>

  );
}




export function Orders({ orders }) {
  // HELP: is there another place where this is, I don't want to pull it from loader?
  const { language, country } = useLoaderData();
  return (
    <>
      <ul className="flex flex-col gap-8">
        {orders.map((order) => {
          const [legacyOrderId, key] = order!.id!.split('/').pop()!.split('?');

          return (
            <li
              key={order?.id}
              className="rounded-3xl border bg-white px-8 py-3 flex flex-col lg:flex-row lg:justify-between items-start lg:items-center w-full"
            >
              <dl className="flex flex-col lg:flex-row gap-x-10">
                <div className="flex flex-row lg:flex-col gap-x-2">
                  <dt className="font-bold">Order Placed:</dt>
                  <dd>
                    {new Intl.DateTimeFormat(`${language}-${country}`, {
                      month: 'long',
                      day: 'numeric',
                    }).format(new Date(order.processedAt))}
                  </dd>
                </div>
                <div className="flex flex-row lg:flex-col gap-x-2">
                  <dt className="font-bold">Total:</dt>
                  <dd>
                    <Money data={order?.currentTotalPrice} />
                  </dd>
                </div>
                <div className="flex flex-row lg:flex-col gap-x-2">
                  <dt className="font-bold">Shipped To:</dt>
                  <dd>
                    {order?.shippingAddress?.firstName}{' '}
                    {order?.shippingAddress?.lastName}
                  </dd>
                </div>
                <div className="flex flex-row lg:flex-col gap-x-2">
                  <dt className="font-bold">Order #:</dt>
                  <dd>{order?.orderNumber}</dd>
                </div>
              </dl>
              <div className="flex items-center divide-x">
                <div className="mr-3">
                  <TextLink to={`/account/orders/${legacyOrderId}?${key}`}>
                    Order Details
                  </TextLink>
                </div>
                <div>
                  <a
                    href={order?.statusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="ml-3" variant="primary">
                      Track Package
                    </Button>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export const CUSTOMER_QUERY = `#graphql
  query CustomerDetails(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
    $ordersShownOnAccount: Int!
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      phone
      email
      tags
      defaultAddress {
        id
        formatted
        firstName
        lastName
        company
        address1
        address2
        country
        province
        city
        zip
        phone
      }
      addresses(first: 6) {
        edges {
          node {
            id
            formatted
            firstName
            lastName
            company
            address1
            address2
            country
            province
            city
            zip
            phone
          }
        }
      }
      orders(first: $ordersShownOnAccount, sortKey: PROCESSED_AT, reverse: true) {
        totalCount
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            orderNumber
            statusUrl
            shippingAddress {
              firstName
              lastName
            }
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 2) {
              edges {
                node {
                  variant {
                    image {
                      url
                      altText
                      height
                      width
                    }
                  }
                  title
                }
              }
            }
          }
        }
      }
      favorites: metafields(identifiers: {
        namespace: "arena",
        key: "favorites"
      }) {
        id
        description
        type
        value
      }
      proStatus: metafield(namespace: "arena", key: "proAccount") {
        key
        value
      }
    }
  }
`;

export async function getCustomer(
  context: AppLoadContext,
  customerAccessToken: string,
) {
  const { storefront } = context;

  const data = await storefront.query<{
    customer: Customer & { proStatus: { value: string } };
  }>(CUSTOMER_QUERY, {
    variables: {
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
      ordersShownOnAccount: ORDERS_SHOWN_ON_ACCOUNT,
    },
    cache: storefront.CacheNone(),
  });

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (!data || !data.customer) {
    throw await doLogout(context);
  }

  return data.customer;
}
