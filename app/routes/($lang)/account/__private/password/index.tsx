import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { CustomerAccessTokenCreatePayload, CustomerUpdateInput, CustomerUpdatePayload } from '@shopify/hydrogen/storefront-api-types';
import { ActionFunction, AppLoadContext, redirect } from '@shopify/remix-oxygen';
import React from 'react'
import { badRequest } from 'remix-utils';
import AccountSideBar from '~/components/AccountSideBar';
import { TextField } from '~/components/Input';

export const action: ActionFunction = async ({ request, context, params }) => {
    const { session, storefront } = context;
    const formData = await request.formData();
    const email = session.get('email');
    const password = formData.get('password');
    const newpassword = formData.get('newpassword');
    const confirmpassword = formData.get('confirmpassword');
    let errors;
    let response;

    const checkPasswordValidity = (password) => {
        const hasMinLength = password.length >= 8;
        const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasCapitalLetter = /[A-Z]/.test(password);
        return hasMinLength && hasSpecialCharacter && hasCapitalLetter;
    };



    if (!password || typeof password !== 'string' || !newpassword || typeof newpassword !== 'string' || !confirmpassword || typeof confirmpassword !== 'string') {
        errors = badRequest({
            formError: 'Please provide valid values for password, new password, and confirm password.',
        });
        return errors; // Stop execution if there are validation errors
    }

    if (checkPasswordValidity(newpassword) == false) {
        errors = badRequest({
            passwordtypeError: 'Password must be 8 characters with a capital letter and special character.',
        });
        return errors;
    }

    if (newpassword !== confirmpassword) {
        errors = badRequest({
            passwordError: 'New password and confirm password do not match.',
        });
        return errors; // Stop execution if there is a password mismatch
    }

    let newcustomerAccessToken = null;

    try {
        const customerAccessToken = await doLogin(context, { email, password });
        newcustomerAccessToken = customerAccessToken;
        context.session.set('customerAccessToken', customerAccessToken);
    } catch (error: any) {
        if (storefront.isApiError(error)) {
            return badRequest({
                formError: 'Something went wrong. Please try again later.',
            });
        }

        return badRequest({
            wrongpasswordError: 'Invalid Password',
        });
    }

    // return newcustomerAccessToken;
    if (newcustomerAccessToken) {
        try {
            const customer: CustomerUpdateInput = {};

            (customer.password = newpassword as string);


            const data = await context.storefront.mutate<{
                customerUpdate: CustomerUpdatePayload;
            }>(CUSTOMER_UPDATE_MUTATION, {
                variables: {
                    newcustomerAccessToken,
                    customer,
                },
            });


            return redirect(params?.lang ? `${params.lang}/account/password` : '/account/password');


        } catch (error: any) {
            return badRequest({ formError: error.message });
        }
    }
};


const index = () => {
    const actionData = useActionData();
    console.log(actionData);

    const activeNavValue = 'password';
    return (
        <>
            <div className='bg-neutral-98'>
                <div className="content-wrapper">
                    <div className="w-full sm:flex sm:justify-start">
                        {/* side bar start */}
                        <AccountSideBar activeNav={activeNavValue} />
                        {/* side bar end */}
                        {/*password right side start */}
                        <div className="w-full sm:w-[calc(100%_-_270px)] sm:pt-24 bg-neutral-98">
                            <div className="pt-14 pb-8 sm:pb-0 sm:pt-0 sm:pl-32">
                                <div className="flex justify-start items-center">
                                    <h1 className="font-extrabold mr-4 text-[28px] sm:text-4xl text-neutral-8 sm:mr-7">
                                        Passwords & Security
                                    </h1>
                                </div>
                                <p className="text-base pt-4 sm:text-lg text-neutral-8 sm:pt-4">Password must be 8 characters long with one capital letter and one special character.</p>
                                <Form method='post' action=''>
                                    {actionData?.formError && (
                                        <div className="flex items-center justify-center mb-6 bg-zinc-500">
                                            <p className="m-4 text-s text-contrast">{actionData.formError}</p>
                                        </div>
                                    )}
                                    <div className="space-y-12">
                                        <div className="pb-8">
                                            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                                                <div className="sm:col-span-full">
                                                    <div className="mt-1 relative">
                                                        <TextField
                                                            className="block w-full rounded-md border-0 py-2.5 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                            id="password"
                                                            name="password"
                                                            label="Current Password"
                                                            type="password"
                                                            autoComplete="current-password"
                                                            aria-label="Password"
                                                            minLength={8}
                                                            required
                                                            error={actionData?.wrongpasswordError}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <div className="mt-1">
                                                        <TextField
                                                            className="block w-full rounded-md border-0 py-2.5 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                            id="newpassword"
                                                            name="newpassword"
                                                            label="New Password"
                                                            type="password"
                                                            autoComplete="current-password"
                                                            aria-label="Password"
                                                            minLength={8}
                                                            required
                                                            error={actionData?.passwordtypeError}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <div className="mt-1">
                                                        <TextField
                                                            className="block w-full rounded-md border-0 py-2.5 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                            id="confirmpassword"
                                                            name="confirmpassword"
                                                            label="Confirm Password"
                                                            type="password"
                                                            autoComplete="current-password"
                                                            aria-label="Password"
                                                            minLength={8}
                                                            required
                                                            error={actionData?.passwordError}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className='mb-8 sm:mb-0 flex-col flex justify-center items-center sm:flex-row sm:justify-start sm:items-center sm:space-x-'>
                                            <button
                                                className="block w-full sm:inline-block rounded-full text-center py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white sm:w-auto mt-1"
                                                type="submit"
                                            >
                                                Save Password
                                            </button>
                                            <p className="block sm:inline-block text-center pt-3 pb-0.5 sm:ml-4 font-extrabold transition-colors text-green-30 sm:w-auto mt-1 border-b-2 border-[#b1bbad] cursor-pointer" onClick={() => window.location.href = '/account/password'}>
                                                Cancel
                                            </p>
                                        </div>
                                    </div>
                                </Form>
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
                        {/* Password right side end */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default index;

const LOGIN_MUTATION = `#graphql
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

export async function doLogin(
    { storefront }: AppLoadContext,
    {
        email,
        password,
    }: {
        email: string;
        password: string;
    },
) {
    const data = await storefront.mutate<{
        customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
    }>(LOGIN_MUTATION, {
        variables: {
            input: {
                email,
                password,
            },
        },
    });

    if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
        return data.customerAccessTokenCreate.customerAccessToken.accessToken;
    }

    /**
     * Something is wrong with the user's input.
     */
    throw new Error(
        data?.customerAccessTokenCreate?.customerUserErrors.join(', '),
    );
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate($newcustomerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $newcustomerAccessToken, customer: $customer) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;