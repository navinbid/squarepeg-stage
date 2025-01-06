import React, { useEffect, useState } from 'react';
import AccountSideBar from '~/components/AccountSideBar';
import ProBanifitInactive from '~/components/ProBanifitInactive';
import ProBanifitActive from '~/components/ProBanifitActive';
import ProBanifitPending from '~/components/ProBanifitPending';
import { AppLoadContext, LoaderArgs, redirect } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { error } from 'cypress/types/jquery';
import { Customer } from '@shopify/hydrogen/storefront-api-types';
import { ORDERS_SHOWN_ON_ACCOUNT } from '~/lib/const';

export async function loader({ context, params }) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.lang ? `${params.lang}/account/login` : '/account/login',
    );
  }

  const customer = await getCustomer(context, customerAccessToken);

  console.log(customer.id);
  const idarr = customer.id.split('Customer/');

  try {
    const myHeaders = new Headers();
    myHeaders.append(
      'X-Shopify-Access-Token',
      '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',
    );
    myHeaders.append('Content-Type', 'application/json');

    const response = await fetch(
      'https://ecom-newbrand.myshopify.com/admin/api/2022-07/customers/' +
      idarr[1] +
      '/metafields.json',
      {
        headers: myHeaders,
      },
    );

    const customerdata = await fetch(
      `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/${idarr[1]}.json`,
      {
        headers: myHeaders,
      },
    )
      .then((response) => response.text())
      .then((result) => {
        return result;
      });

    const data = await response.json();
    console.log(data);
    return {
      data,
      customerdata,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }

  return new Response(null);
}

interface AccountSideBarProps {
  activeNav: any; // Replace 'any' with the appropriate type
}

const ProBenefits: React.FC = () => {
  const data = useLoaderData();
  // console.log(customerdata)
  useEffect(() => {
    if (data.data?.metafields[0]?.value == 1) {
      localStorage.setItem('pro', 'true');
    } else {
      localStorage.setItem('pro', 'false');
    }
  }, [data.data.metafields[0]?.value]);

  const activeNavValue = 'probenefits';
  const customerdata = useLoaderData();
  useEffect(() => {
    sessionStorage.setItem('customerdata', customerdata.customerdata)
  }, [customerdata]);

  return (
    <>
      <div className='bg-neutral-98'>
        <div className="content-wrapper">
          <div className="w-full sm:flex sm:justify-start">
            <AccountSideBar activeNav={activeNavValue} />
            {data.data.metafields[0]?.value === 1 ? (
              <ProBanifitActive />
            ) : data.data.metafields[0]?.value === 2 ? (
              <ProBanifitPending />
            ) : (
              <ProBanifitInactive />
            )}

            {/* <ProBanifitPending /> */}

            {/* /* hello {data.data.metafields[0]?.id} */}
          </div>
        </div>
      </div>
    </>

  );
};

export default ProBenefits;

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
