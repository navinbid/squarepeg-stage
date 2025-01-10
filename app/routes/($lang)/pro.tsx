import {
  defer,
  redirect,
  type LoaderArgs,
  ActionFunction,
  AppLoadContext,
} from '@shopify/remix-oxygen';
import { Suspense } from 'react';
import { Await, useLoaderData, useMatches } from '@remix-run/react';
import React, { useEffect, useState } from 'react';
import {
  ProductSwimlane,
  FeaturedCollections,
  Hero,
  Grid,
  Section,
} from '~/components';
import { MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { getHeroPlaceholder } from '~/lib/placeholders';
import type {
  CollectionConnection,
  Customer,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  Metafield,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import { AnalyticsPageType } from '@shopify/hydrogen';
import {
  getFeaturedBrands,
  getHomepageCollection,
  getHomepageSlides,
} from '~/lib/sanity';
import { SanityProductCard } from '~/components/SanityProductCard';
import { FeaturedBrands } from '~/components/FeaturedBrands';
import { SanityBrandType } from '~/lib/sanity-types';
import { Benefits } from '~/components/Benefits';
import { ImageSlider } from '~/components/ImageSlider';
import DiscoverMoreSection from '~/components/DiscoverMoreSection';
import { appendDiscountsToProducts } from '~/lib/shopify-admin.server';
import { BENEFITS } from '~/lib/static-content';
import { getVariantsByUserProStatus } from '~/lib/product-variant';
import Herobg from '~/assets/hero.png';
import Client1 from '~/assets/client1.png';
import Client2 from '~/assets/client2.png';
import Client3 from '~/assets/client3.png';
import Client4 from '~/assets/client4.png';
import Client5 from '~/assets/client5.png';
import Client6 from '~/assets/client6.png';
import Client7 from '~/assets/client7.png';
import Benefits1 from '~/assets/benefits1.png';
import Benefits2 from '~/assets/benefits2.png';
import Benefits3 from '~/assets/benefits3.png';
import Benefits4 from '~/assets/benefits4.png';
import Benefits5 from '~/assets/benefits5.png';
import YellowCap from '~/assets/yellow-cap.png';
import Arrow from '~/assets/arrow.png';
import Works1 from '~/assets/1.png';
import Works2 from '~/assets/2.png';
import Works3 from '~/assets/3.png';
import SliderLeft from '~/assets/sliderleft.png';
import SliderRight from '~/assets/sliderright.png';
import Group1 from '~/assets/group1.png';
import ProFormModal from '~/components/ProFormModal';
import { doLogin } from './account/__public/login';
import { badRequest } from 'remix-utils';
import { ORDERS_SHOWN_ON_ACCOUNT } from '~/lib/const';
import { sendEmail } from '../../components/sendEmail'


interface HomeSeoData {
  shop: {
    name: string;
    description: string;
  };
}

export interface CollectionHero {
  byline: string;
  cta: string;
  handle: string;
  heading: Metafield;
  height?: 'full';
  loading?: 'eager' | 'lazy';
  spread: Metafield;
  spreadSecondary: Metafield;
  top?: boolean;
  title: string;
  image: MediaImage;
}

export async function loader({ params, context }: LoaderArgs) {
  // const { language, country } = context.storefront.i18n;

  // if (
  //   params.lang &&
  //   params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  // ) {
  //   // If the lang URL param is defined, yet we still are on `EN-US`
  //   // the the lang param must be invalid, send to the 404 page
  //   throw new Response(null, { status: 404 });
  // }

  // const { shop, hero } = await context.storefront.query<{
  //   hero: CollectionHero;
  //   shop: HomeSeoData;
  // }>(HOMEPAGE_SEO_QUERY, {
  //   variables: { handle: 'freestyle' },
  // });

  // const { collection, homepageProducts } = await getHomepageCollection();

  // // @TODO: Defer this after finishing it
  // const featuredBrands = await getFeaturedBrands();

  // const homepageSlides = await getHomepageSlides();

  // const featuredProducts = await context.storefront.query<{
  //   products: ProductConnection;
  // }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY);

  // const featuredProductsWithDiscounts = await appendDiscountsToProducts(
  //   featuredProducts.products.nodes,
  // );

  // const filteredProductsWithDiscounts = featuredProductsWithDiscounts.map(
  //   (product) => {
  //     // filter out pro or standard variants based on user pro status
  //     const filteredVariants = getVariantsByUserProStatus(product, context);

  //     // update product with filteredVariants
  //     product.variants.nodes = filteredVariants;
  //     return product;
  //   },
  // );

  const customerAccessToken = await context.session.get('customerAccessToken');
  let data;
  if (!customerAccessToken) {
    data = '';
  } else {
    const customer = await getCustomer(context, customerAccessToken);

    console.log(customer.id);
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

  console.log('customer data', data);

  return defer({
    data,

  });
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const { session, storefront, env } = context;
  const formData = await request.formData();


  var myHeaders = new Headers();
  myHeaders.append("revision", "2023-12-15");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Klaviyo-API-Key pk_b77a2ab9e704f56652075e534f5bdfb01b");

  var raw = JSON.stringify({
    "data": {
      "type": "event",
      "attributes": {
        "properties": {},
        "metric": {
          "data": {
            "type": "metric",
            "attributes": {
              "name": "Pending Pro"
            }
          }
        },
        "profile": {
          "data": {
            "type": "profile",
            "id": "01HN0K3XQNZ3ZJRHM6FH82RB5P",
            "meta": {
              "patch_properties": {
                "append": {},
                "unappend": {},
                "unset": "<string>"
              }
            }
          }
        }
      }
    }
  });


  fetch("https://a.klaviyo.com/api/events/", {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  });

  //event end


  const email = formData.get('email');
  const password = formData.get('email');
  const firstName = formData.get('email');
  const lastName = formData.get('email');

  const metafields = [
    {
      namespace: 'arena',
      key: 'proAccount',
      type: 'number_integer',
      value: 1,
    },
  ];

  //  return  {email, password, firstName, lastName, metafields};

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide email, first name, last name, and password.',
    });
  }

  // try {
  const customerId = formData.get('customerId');
  // console.log('customerId');

  // Check if the value is undefined or blank
  let id;
  if (customerId === undefined || customerId === '') {
    const datas = await storefront.mutate<{
      customerCreate: CustomerCreatePayload;
    }>(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: { email, password, firstName, lastName },
      },
    });
    // console.log({ data: JSON.stringify(data) });

    id = datas?.customerCreate?.customer?.id;
  } else {
    id = customerId;
  }

  //return id;
  const idarr = id.split('Customer/');

  try {
    const myHeaders = new Headers();
    myHeaders.append(
      'X-Shopify-Access-Token',
      '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',
    );
    myHeaders.append('Content-Type', 'application/json');


    const datas = JSON.stringify({
      "customer": {
        "tags": formData.get('typeofbusigness'),
        "phone": formData.get('phoneNumber'),
        "tax_exempt": formData.get('taxexampt'),
        "addresses": [
          {
            "company": formData.get('companyName'),
            "address1": formData.get('companyAddress'),
            "city": formData.get('city'),
            "province": formData.get('state'),
            "zip": formData.get('zipCode'),
            "phone": formData.get('phoneNumber'),
            "country": "United States",
            "numberemployees": formData.get('numberemployees'),
            "role": formData.get('role'),
          }
        ]

      }
    });

    // Usage
    const isMailSent = await sendEmail(
      formData,
      formData.get('email'),
      formData.get('customerFullName'),
      formData.get('typeofbusigness'),
      formData.get('phoneNumber'),
      Boolean(formData.get('taxexampt')) ? 'Yes' : 'No',
      formData.get('companyName'),
      formData.get('companyAddress'),
      formData.get('city'),
      formData.get('state'),
      formData.get('zipCode'),
      formData.get('numberemployees'),
      formData.get('role'),
      env
    );

    const storedata = await fetch(
      `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/` +
      idarr[1] +
      '.json',
      {
        method: 'PUT',
        headers: myHeaders,
        body: datas,
        redirect: 'follow',
      },
    )
      .then((response) => response.text())
      .then((result) => {
        return result;
      })
      .catch((error) => console.log('error', error));

    const raw = JSON.stringify({
      metafield: {
        key: 'proAccount',
        value: '2',
        type: 'number_integer',
        namespace: 'arena',
      },
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };


    const resp = await fetch(
      'https://ecom-newbrand-dev.myshopify.com/admin/api/2022-07/customers/' +
      idarr[1] +
      '/metafields.json',
      {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      },
    )
      .then((response) => response.text())
      .then((result) => {
        return result;
      })
      .catch((error) => console.log('error', error));


    return true;
  } catch (error) {
    return badRequest({
      formError: error?.cause?.message,
    });
  }
};


const NonProHome: React.FC = () => {
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const { data } = useLoaderData();

  const handleApplyNowClick = () => {
    if (
      data &&
      data.metafields &&
      data.metafields[0] &&
      data.metafields[0].value
    ) {
      window.location.href = '/account/pro-benefits';
    } else {
      window.location.href = '/account/pro-benefits?register=true';
    }
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
  };

  return (
    <>


      <div className="z-30 relative shadow-navDropdown">
      </div>

      <div className='homeheader sm:py-[70px]'>
        <div className='content-wrapper'>
          <div className="text-white pt-8 pb-10 md:pt-24 md:pb-24">
            <h1 className=" text-3xl md:text-[4rem] pb-5 md:pb-10 font-extrabold">For Pros</h1>
            <p className=" w-auto text-base md:w-[26rem] md:text-[1.6rem] md:leading-8">
              Level up your expertise with our Pro Program, featuring exclusive
              benefits and support for professional success.
            </p>
            <button
              className=" mt-6 text-base px-5 py-2 md:h-[3rem] md:w-[9.1rem] md:mt-[3rem] font-extrabold md:text-[1rem] text-[#446039] bg-[#eef3d8] rounded-[5rem]"
              onClick={handleApplyNowClick}
            >
              Apply Now
            </button>
            <ProFormModal isOpen={isFormModalOpen} onClose={handleCloseModal} />
          </div>
        </div>
        {/* <img src={Herobg} className="h-[100] w-full" alt="Hero Banner" /> */}

      </div>
      <div className="flex text-center justify-center items-center mt-[3rem]">
        <p className="text-[1.125rem] font-extrabold text-[#160E1B] px-4">
          Providing You with Trusted Vendors and Industry-Leading Brands
        </p>
      </div>
      <div className="flex text-center justify-center items-center mt-[1.5rem] gap-[1.25rem] flex-wrap pb-10">
        <img src={Client1} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client1" />
        <img src={Client2} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client2" />
        <img src={Client3} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client3" />
        <img src={Client4} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client4" />
        <img src={Client5} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client5" />
        <img src={Client6} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client6" />
        <img src={Client7} className="w-[10rem] h-[5.5rem] bg-commonbg rounded-lg" alt="Client7" />
      </div>


      <div className='bg-commonbg'>
        <div className="flex text-center justify-center items-center pt-14 md:pt-28">
          <h1 className="text-3xl md:text-[2.25rem] text-[#160E1B] font-extrabold">
            Our Pro Benefits
          </h1>
        </div>
        <div className="flex-col content-wrapper mt-11 md:flex-row md:flex md:text-center md:justify-between md:items-center md:mt-[4.5rem] mb-5 md:mb-[8rem] md:gap-[2rem]">
          <div className="text-center pb-4">
            <img
              src={Benefits1}
              className="w-[4rem] h-[4rem] mx-auto"
              alt="Benefits1"
            />
            <br />
            <h1 className="text-[1.125rem] font-bold text-center text-neutral-8">
              Fast Delivery
            </h1>
            <p className="text-[1rem] font-normal text-neutral-44 text-center mt-[0.5rem]">
              Get your products delivered swiftly with our efficient and reliable
              shipping services.
            </p>
          </div>
          <div className="text-center pb-4">
            <img
              src={Benefits2}
              className="w-[4rem] h-[4rem] mx-auto"
              alt="Benefits2"
            />
            <br />
            <h1 className="text-[1.125rem] font-bold text-center text-neutral-8">
              Lower Prices
            </h1>
            <p className="text-[1rem] font-normal text-neutral-44 text-center mt-[0.5rem]">
              Get cost-effective solutions without compromising quality and
              competitive pricing.
            </p>
          </div>
          <div className="text-center pb-4">
            <img
              src={Benefits3}
              className="w-[4rem] h-[4rem] mx-auto"
              alt="Benefits3"
            />
            <br />
            <h1 className="text-[1.125rem] font-bold text-center text-neutral-8">
              Easy Reorder & Returns
            </h1>
            <p className="text-[1rem] font-normal text-neutral-44 text-center mt-[0.5rem]">
              Streamline your ordering process and hassle-free returns for
              ultimate convenience.
            </p>
          </div>
          <div className="text-center pb-4">
            <img
              src={Benefits4}
              className="w-[4rem] h-[4rem] mx-auto"
              alt="Benefits4"
            />
            <br />
            <h1 className="text-[1.125rem] font-bold text-center text-neutral-8">
              Exclusive Gear
            </h1>
            <p className="text-[1rem] font-normal text-neutral-44 text-center mt-[0.5rem]">
              Discover a selection of exclusive gear that sets you apart from the
              competition.
            </p>
          </div>
          <div className="text-center pb-4">
            <img
              src={Benefits5}
              className="w-[4rem] h-[4rem] mx-auto"
              alt="Benefits5"
            />
            <br />
            <h1 className="text-[1.125rem] font-bold text-center text-neutral-8">
              Great Support
            </h1>
            <p className="text-[1rem] font-normal text-neutral-44 text-center mt-[0.5rem]">
              Experience exceptional support from our dedicated team, assisting
              you every step.
            </p>
          </div>
        </div>
        <div className='content-wrapper'>
          <div className="mb-12 md:flex md:justify-between md:items-center bg-white rounded md:mb-[8rem]">
            <div className="md:w-1/2 pb-6 md:pb-0 md:px-16">
              <h1 className="text-3xl pb-7 text-center md:text-left md:text-[2.25rem] font-extrabold">Why Become a Pro?</h1>
              <p className="text-[1.125rem] font-normal">
                We offer a better way to get the job done. For any project, big or small, you can
                count on our dedicated team to help you find the best price possible on the highest quality tools
                and materials.
              </p>
            </div>
            <div className="md:w-1/2">
              <img src={YellowCap} className="md:pl-7" alt="Yellow cap guy" />
            </div>
          </div>
        </div>
        <div className='content-wrapper'>
          <div className="mb-12 flex text-center justify-center md:mb-[4.5rem] flex-col">
            <h1 className="text-3xl text-center md:text-[2.25rem] font-extrabold">How It Works</h1>
            <p className="text-[1.125rem] font-normal mt-[0.5rem] mb-5">
              Become a Pro with SquarePeg in three easy steps!
            </p>
            <button className="text-[#446039] flex text-center items-center text-base font-extrabold justify-center" onClick={handleApplyNowClick} >
              Apply Now{' '}
              <img src={Arrow} className="ml-2" alt="Right Arrow" />
            </button>
          </div>
          <div className="mb-12 md:mb-[9rem]">
            <div className="md:flex md:items-start md:justify-between sm:pb-36">
              <div className="bg-white mb-6 md:mb-0 rounded-xl w-full md:w-[31.5%] p-7">
                <img src={Works1} className="w-[4rem] h-[4rem]" alt="Works1" />
                <h1 className="text-[1.125rem] font-bold mt-[1rem] ">
                  Apply Online
                </h1>
                <p className="text-[1rem] font-normal mt-[0.5rem]">
                  Fill out our application form and submit it to us for approval. It only takes a few minutes!
                </p>
              </div>
              <div className="bg-white mb-6 md:mb-0 rounded-xl w-full md:w-[31.5%] p-7">
                <img src={Works2} className="w-[4rem] h-[4rem]" alt="Works2" />
                <h1 className="text-[1.125rem] font-bold mt-[1rem]">
                  Our Team Approves
                </h1>
                <p className="text-[1rem] font-normal mt-[0.5rem]">
                  After reviewing your application, our team will notify you of your acceptance into our Pro
                  Program.
                </p>
              </div>
              <div className="bg-white mb-6 md:mb-0 rounded-xl w-full md:w-[31.5%] p-7">
                <img src={Works3} className="w-[4rem] h-[4rem]" alt="Works3" />
                <h1 className="text-[1.125rem] font-bold mt-[1rem]">
                  Start Shopping As a Pro
                </h1>
                <p className="text-[1rem] font-normal mt-[0.5rem]">
                  Use your new Pro account to access low prices, high-quality materials, order tracking, and
                  more!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>




      <div className="mt-[2rem] mb-[11rem] hidden md:block">
        <div className="flex justify-center align-center items-center mt-[4.5rem] gap-[6rem]">
          <div>
            <h1 className="text-[2.25rem] font-extrabold">What Our Pros Say</h1>
            <img
              src={Group1}
              className="w-[2.05rem] h-[1.25rem] mt-[6.25rem]"
              alt="Group"
            />
            <p className="text-[1.875rem] italic font-normal mt-[1.5rem] w-[36rem]">
              “SquarePeg is AWESOME.  When I called about my order their customer service was friendly and quick to respond.  So happy there are companies like this still around.”
            </p>
            <h1 className="text-[1rem] font-bold mt-[1.5rem]">
              -Julie, Virginia
            </h1>
            {/* <p className="text-[1rem] font-normal">Organization Name</p> */}
          </div>
          <div>
            <div className="flex justify-end gap-[0.5rem]">
              <img
                src={SliderLeft}
                className="w-[3rem] h-[3rem]"
                alt="Sliderleft"
              />
              <img
                src={SliderRight}
                className="w-[3rem] h-[3rem]"
                alt="Sliderright"
              />
            </div>
            <img
              src={Group1}
              className="w-[2.05rem] h-[1.25rem] mt-[6.25rem]"
              alt="Group"
            />
            <p className="text-[1.875rem] italic font-normal mt-[1.5rem] w-[36rem]">
              “Great products and good prices. Fast delivery as well. Definitely recommend SquarePeg!”
            </p>
            <h1 className="text-[1rem] font-bold mt-[1.5rem]">
              -Douglas, Florida
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Homepage() {
  return (
    <div>
      <NonProHome />
    </div>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 12) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;

const CUSTOMER_CREATE_MUTATION = `#graphql
mutation customerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      
    }
    customerUserErrors {
      code
      field
      message
    }
  }
}
`;

const CUSTOMER_UPDATE_MUTATION = `#graphql
mutation MetafieldsSet($input: CustomerInput!) {
  mutation MetafieldsSet(input: $input) {
    customer {
      id
      metafields(first: 5) {
        edges {
          node {
            id
            owner_id
            namespace
            key
            value
          }
        }
      }
    }
    userErrors {
      message
      field
    }
  }
}

`;
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
      ordersShownOnAccount: ORDERS_SHOWN_ON_ACCOUNT,
    },
    cache: storefront.CacheNone(),
  });

  return data.customer;
}
