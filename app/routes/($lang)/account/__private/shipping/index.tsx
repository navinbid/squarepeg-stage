import { Form, Link, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { Customer } from '@shopify/hydrogen/storefront-api-types';
import { ActionFunction, AppLoadContext, LoaderArgs, defer, redirect } from '@shopify/remix-oxygen';
import React from 'react'
import { badRequest } from 'remix-utils';
import AccountSideBar from '~/components/AccountSideBar';

export async function loader({ request, context, params }: LoaderArgs) {
    const customerAccessToken = await context.session.get('customerAccessToken');
    const customer = await getCustomer(context, customerAccessToken);

    const idarr = customer.id.split('Customer/');
    const cid = idarr[1];
    context.session.set('cid', cid)
    const myHeaders = new Headers();
    myHeaders.append(
        'X-Shopify-Access-Token',
        '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',
    );
    myHeaders.append('Content-Type', 'application/json');
    const shippingdata = await fetch(
        `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/${idarr[1]}/addresses.json`,
        {
            headers: myHeaders,
        },
    )
        .then((response) => response.text())
        .then((result) => {
            return result;
        });

    return defer({
        shippingdata,
        cid

    });

}

export const action: ActionFunction = async ({ request, context, params }) => {
    const formData = await request.formData();
    let errors;
    let response;

    const aid = formData.get('address_id') as string;
    const cid = formData.get('customer_id') as string;

    const myHeaders = new Headers();
    myHeaders.append('X-Shopify-Access-Token', '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');

    try {
        if (formData.get('edit') != null) {
            return redirect('edit/' + aid);
        } else if (formData.get('makedefault') != null) {
            const update_default = await fetch(
                `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/${cid}/addresses/${aid}/default.json`,
                {
                    headers: myHeaders,
                    method: 'PUT'
                },
            );

            if (!update_default.ok) {
                // Handle non-successful status code
                errors = badRequest({
                    formError: `Error updating default address. Status: ${update_default.status}`,
                });
                return errors;
            }

            response = await update_default.text();
            return response;
        } else if (formData.get('remove') != null) {
            const deletes = await fetch(
                `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/${cid}/addresses/${aid}.json`,
                {
                    headers: myHeaders,
                    method: 'DELETE'
                },
            );

            if (!deletes.ok) {
                errors = badRequest({
                    formError: "Cannot delete the customer’s default address Make Another Default",
                });
                return errors;
            }

            response = { success: true, message: "Address deleted successfully" };
            return response;
        } else {
            errors = badRequest({
                formError: 'Something went wrong during make default. Please try again later.',
            });
            return errors;
        }
    } catch (error) {
        console.error("Error:", error);
        errors = badRequest({
            formError: 'Something went wrong during make default. Please try again later.',
        });
        return errors;
    }
}


const index = () => {
    const navigate = useNavigate();
    const actionData = useActionData();
    console.log(actionData);
    const { shippingdata, cid } = useLoaderData();
    console.log(cid)
    const addresses = JSON.parse(shippingdata).addresses;
    const activeNavValue = 'shipping';
    return (
        <>
            <div className='bg-neutral-98'>
                <div className="content-wrapper">
                    <div className="w-full sm:flex sm:justify-start">
                        {/* side bar start */}
                        <AccountSideBar activeNav={activeNavValue} />
                        {/* side bar end */}
                        {/*shipping right side start */}
                        <div className="w-full sm:w-[calc(100%_-_270px)] sm:pt-24 bg-neutral-98">
                            <div className="pt-14 pb-8 sm:pb-0 sm:pt-0 sm:pl-32">
                                {actionData?.formError && (
                                    <div className="flex items-center justify-center mb-6 bg-zinc-500">
                                        <p className="m-4 text-s text-contrast">{actionData.formError}</p>
                                    </div>
                                )}
                                {actionData?.success && (
                                    <div className="flex items-center justify-center mb-6 bg-lime-70">
                                        <p className="m-4 text-s text-black-500">{actionData.message
                                        }</p>
                                    </div>
                                )}

                                <div className="flex justify-start items-center">
                                    <h1 className="font-extrabold mr-4 text-[28px] sm:text-4xl text-neutral-8 sm:mr-7">
                                        Shipping Information
                                    </h1>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-full mt-7">
                                    {addresses.map((address, key) => (
                                        <div className="relative flex items-center space-x-3 rounded-3xl border border-gray-300 bg-white px-6 py-5 shadow-sm" key={key}>
                                            {address.default && (
                                                <div className="bg-neutral-92 absolute top-5 right-5 rounded-3xl px-5 py-2 text-xs text-neutral-8 font-medium flex justify-start items-center">
                                                    <span className="">Default</span>
                                                </div>
                                            )}

                                            {/* <div className="bg-neutral-92 absolute top-5 right-5 rounded-3xl px-5 py-2 text-xs text-neutral-8 font-medium flex justify-start items-center">
                                                <span className="">Default</span>
                                            </div> */}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-lg font-bold text-neutral-8">{address.first_name} {address.last_name}</p>
                                                <div className='py-3 text-base text-neutral-8'>
                                                    <p>{address.address1}</p>
                                                    <p>{address.city}</p>
                                                    <p>{address.country}</p>
                                                </div>
                                                <nav className="flex">
                                                    <Form method="post" action=''>
                                                        <input type="hidden" name="address_id" value={address?.id} />
                                                        <input type="hidden" name="customer_id" value={cid} />
                                                        <ol className="flex items-center space-x-1 pt-4">

                                                            {!address.default && (<li>
                                                                <div className="flex items-center">
                                                                    <button name="makedefault"
                                                                        className="text-base font-extrabold text-neutral-8"
                                                                    >
                                                                        Make Default
                                                                    </button>
                                                                </div>
                                                            </li>)}
                                                            <li>
                                                                <div className="flex items-center">
                                                                    {!address.default && (
                                                                        <svg
                                                                            className="h-5 w-5 flex-shrink-0 text-gray-300 -rotate-[27deg]"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                                                        </svg>
                                                                    )}
                                                                    <button name="edit"
                                                                        className="ml-1 text-base font-extrabold text-neutral-8"

                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            </li>

                                                            <li>
                                                                <div className="flex items-center">
                                                                    <svg
                                                                        className="h-5 w-5 flex-shrink-0 text-gray-300 -rotate-[27deg]"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                                                    </svg>
                                                                    <button
                                                                        name='remove'
                                                                        className="ml-1 text-base font-extrabold text-neutral-8"

                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </li>

                                                        </ol>
                                                    </Form>
                                                </nav>
                                            </div>
                                        </div>
                                    ))}

                                    {/* <div className="relative flex items-center space-x-3 rounded-3xl border border-gray-300 bg-white px-6 py-5 shadow-sm">
                                        <div className="bg-neutral-92 absolute top-5 right-5 rounded-3xl px-5 py-2 text-xs text-neutral-8 font-medium flex justify-start items-center">
                                            <span className="">Default</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg font-bold text-neutral-8">Jane Doe</p>
                                            <div className='py-3 text-base text-neutral-8'>
                                                <p>123 Elm Street</p>
                                                <p>Boston, MA 32145-9876</p>
                                                <p>United States</p>
                                            </div>
                                            <nav className="flex">
                                                <ol className="flex items-center space-x-1 pt-4">
                                                    <li>
                                                        <div className="flex items-center">
                                                            <a
                                                                href="/"
                                                                className="text-base font-extrabold text-neutral-8"
                                                            >
                                                                Make Default
                                                            </a>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="flex items-center">
                                                            <svg
                                                                className="h-5 w-5 flex-shrink-0 text-gray-300 -rotate-[27deg]"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                                            </svg>
                                                            <a
                                                                href="/"
                                                                className="ml-1 text-base font-extrabold text-neutral-8"

                                                            >
                                                                Edit
                                                            </a>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="flex items-center">
                                                            <svg
                                                                className="h-5 w-5 flex-shrink-0 text-gray-300 -rotate-[27deg]"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                                            </svg>
                                                            <a
                                                                href="/"
                                                                className="ml-1 text-base font-extrabold text-neutral-8"

                                                            >
                                                                Remove
                                                            </a>
                                                        </div>
                                                    </li>
                                                </ol>
                                            </nav>
                                        </div>
                                    </div> */}
                                </div>
                                <button className="w-full mt-8 justify-center group items-center rounded-full text-center py-3 px-8 font-extrabold transition-colors border-2 border-brand bg-white text-brand hover:text-white hover:bg-brand sm:w-auto sm-max:mb-10" onClick={() => navigate('/account/shipping/add')}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" className='text-green-30 group-hover:text-white inline-block' fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 10.8333H10.8333V15H9.16667V10.8333H5V9.16667H9.16667V5H10.8333V9.16667H15V10.8333Z" fill="currentColor" />
                                    </svg>
                                    <span className='ml-2'>Add New Address</span>
                                </button>
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
                        {/* shipping right side end */}
                    </div>
                </div>
            </div >
        </>
    )
}

export default index;

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

    return data.customer;
}