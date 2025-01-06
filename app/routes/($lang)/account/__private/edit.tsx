import { Customer } from '@shopify/hydrogen/storefront-api-types';
import { ActionFunction, AppLoadContext, LoaderArgs, defer } from '@shopify/remix-oxygen';
import React, { useEffect, useState } from 'react'
import AccountSideBar from '~/components/AccountSideBar'
import { doLogout } from './logout';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { handle } from '~/root';

export async function loader({ request, context, params }: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  const customer = await getCustomer(context, customerAccessToken);

  return defer({
    customer
  });

}

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();
  const Cid = formData.get('id')


  let id;
  if (!(Cid === undefined) || !(Cid === '')) {
    id = Cid;
  }

  const idarr = id.split('Customer/');
  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');


  const datas = JSON.stringify({
    "customer": {
      "first_name": formData.get('firstName'),
      "last_name": formData.get('lastName'),
      "phone": formData.get('phone'),
      "email": formData.get('email')

    }
  });


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
    .then((response) => response.json())
    .then((result) => {
      return result;
    })
    .catch((error) => console.log('error', error));

  return storedata;
}

const edit = () => {
  const { customer } = useLoaderData();
  // console.log(customer);
  const activeNavValue = 'profile';

  const actionData = useActionData() || null;
  // console.log(actionData);
  console.log(actionData);
  if (actionData?.customer) {
    window.location.href = '/account';
  }


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const formatPhoneNumber = (input) => {
    const cleanedNumber = input?.replace(/^(\+1|\+)/, '');

    // Remove non-numeric characters from the cleaned string
    const numericString = cleanedNumber?.replace(/\D/g, '');

    // Use regular expressions to format the numeric string
    const formattedNumber = numericString?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

    return formattedNumber;
  };

  useEffect(() => {
    if (customer) {
      // setFormData.companyName = customerData?.default_address?.company;
      setFormData(prevFormData => ({
        ...prevFormData,
        firstName: customer?.firstName,
        lastName: customer?.lastName,
        email: customer?.email,
        phone: formatPhoneNumber(customer?.phone)
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  // console.log(formData)
  return (
    <>
      <div className='bg-neutral-98'>
        <div className="content-wrapper">
          <div className="flex justify-start">
            {/* side bar start */}
            <AccountSideBar activeNav={activeNavValue} />
            {/* side bar end */}
            {/* right side start */}
            <div className="w-[calc(100%_-_270px)] pt-24 bg-neutral-98">
              <div className="pl-32">
                {actionData?.errors?.phone[0] && (
                  <div className="flex items-center justify-center mb-6 bg-zinc-500">
                    <p className="m-4 text-s text-contrast">{actionData?.errors?.phone[0]}</p>
                  </div>
                )}
                <div className="flex justify-start items-center">
                  <h1 className="font-extrabold text-3xl text-neutral-8 mr-7">
                    Profile
                  </h1>
                </div>
                <Form action='' method='post'>
                  <input type="hidden" name="id" value={customer.id} />
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
                              name="firstName"
                              id="firstName"
                              autoComplete="given-name"
                              value={formData?.firstName}
                              required
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
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
                              type="text"
                              name="lastName"
                              id="lastName"
                              autoComplete="family-name"
                              required
                              value={formData?.lastName}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-normal leading-6 text-neutral-8">
                            Email<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                          </label>
                          <div className="mt-2">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={formData?.email}
                              onChange={handleInputChange}
                              autoComplete="email"
                              required
                              className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                            Phone Number<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="phone"
                              value={formData?.phone}
                              onChange={handleInputChange}
                              id="phone"
                              placeholder='234-987-7654'
                              pattern="\d{3}-\d{3}-\d{4}"
                              autoComplete="phone"
                              required
                              className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className='space-x-3'>
                      <button
                        className="inline-block rounded-full text-center py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white w-auto mt-1"
                        type="submit"
                      >
                        Save Profile
                      </button>
                      <button className="inline-block text-center pt-3 pb-0.5 mx-4 font-extrabold transition-colors text-green-30 w-auto mt-1 border-b-2 border-[#b1bbad]" onClick={() => window.location.href = '/account'}>
                        Cancel
                      </button>
                    </div>

                  </div>
                </Form>
                <div className=" mt-60 mb-16 w-full bg-neutral-96 rounded-md px-2 py-1.5 text-center font-normal text-sm text-black">
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
  )
}

export default edit


export const CUSTOMER_QUERY = `#graphql
query CustomerDetails(
  $customerAccessToken: String!
) {
  customer(customerAccessToken: $customerAccessToken) {
    id
    firstName
    lastName
    phone
    email
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