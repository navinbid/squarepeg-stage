import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { ActionFunction, LoaderArgs, defer, redirect } from '@shopify/remix-oxygen';
import { json } from 'express';
import React, { useEffect, useState } from 'react'
import { badRequest } from 'remix-utils';
import AccountSideBar from '~/components/AccountSideBar';
import DeletePopUP from '~/components/DeletePopUP';
import { handle } from '~/root';

export async function loader({ request, context, params }: LoaderArgs) {
    const slugs = params.slug;
    const cid = context.session.get('cid');
    const myHeaders = new Headers();
    myHeaders.append(
        'X-Shopify-Access-Token',
        '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',
    );

    const caddress = await fetch(
        `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/${cid}/addresses/${slugs}.json`,
        {
            headers: myHeaders,
        },
    )
        .then((response) => response.text())
        .then((result) => {
            return result;
        });

    return defer({
        slugs,
        cid,
        caddress
    });
}

export const action: ActionFunction = async ({ request, context, params }) => {
    const formData = await request.formData();
    const aid = formData.get('aid') as string;
    const cid = formData.get('cid') as string;
    let errors;
    let response;
    const data = JSON.stringify({
        "customer_address": {
            "first_name": formData.get('firstName'),
            "last_name": formData.get('lastName'),
            "address1": formData.get('address1'),
            "address2": formData.get('address2'),
            "city": formData.get('city'),
            "province": formData.get('state'),
            "zip": formData.get('zipCode'),
            "country": "United States"

        }
    })
    const myHeaders = new Headers();
    myHeaders.append('X-Shopify-Access-Token', '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');
    myHeaders.append("Content-Type", "application/json");
    // return typeof formData.get('remove_address');
    if (formData.get('remove_address') == "true") {
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

        response = redirect("/account/shipping/");
        return response;
    } else {
        try {
            // return myHeaders;
            const update = await fetch(
                `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/customers/` + cid + `/addresses/` + aid + `.json`,
                {
                    headers: myHeaders,
                    method: 'PUT',
                    body: data
                },
            );

            if (update.ok) {
                // If the API request is successful, redirect to /customer
                return redirect('/account/shipping/');
            } else {
                // If there's an error, send a bad request form error
                const errorResponse = await update.json();
                const errorMessage = 'Something went wrong during Update Address. Please try again later.';
                errors = badRequest({
                    formError: errorMessage,
                });
                return errors;
            }

        } catch (error) {
            errors = badRequest({
                formError: 'Something went wrong. Please try again later.',
            });
            return errors;
        }
    }



}

const $slug = () => {
    const actionData = useActionData();
    console.log(actionData);
    const { slugs, cid, caddress } = useLoaderData();
    // console.log(caddress)
    const address = JSON.parse(caddress).customer_address;
    // console.log(address);




    const activeNavValue = 'shipping';
    const indianStates = [
        'Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        // Add more states as needed
    ];


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '' // New property for the selected file
    });

    useEffect(() => {
        if (address) {
            setFormData(prevFormData => ({
                ...prevFormData,
                firstName: address?.first_name,
                lastName: address?.last_name,
                address1: address?.address1,
                address2: address?.address2,
                city: address?.city,
                state: address?.province,
                zipCode: address?.zip



            }));
        }
    }, []);

    // console.log(formData);
    const handleForm = (e) => {
        const { name, value, slugs } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const [DeletePopUPOpen, setDeletePopUPOpen] = useState(true);
    return (
        <>
            <div className='bg-neutral-98'>
                <div className="content-wrapper">
                    <div className="flex justify-start">
                        <AccountSideBar activeNav={activeNavValue} />
                        <div className="w-[calc(100%_-_270px)] pt-24 bg-neutral-98 ">
                            <div className="pl-32">
                                <div className="flex justify-start items-center">
                                    <h1 className="font-extrabold text-4xl text-neutral-8 mr-7">
                                        Shipping Information
                                    </h1>
                                    {address?.default && (
                                        <div className="bg-neutral-92 rounded-3xl px-5 py-2 text-xs text-neutral-8 font-medium flex justify-start items-center">
                                            <span className="">Default</span>
                                        </div>
                                    )}

                                </div>
                                {actionData?.formError && (
                                    <div className="flex items-center justify-center mb-6 bg-zinc-500">
                                        <p className="m-4 text-s text-contrast">{actionData.formError}</p>
                                    </div>
                                )}
                                <Form method='post'>
                                    <input type="hidden" name='cid' value={cid} />
                                    <input type="hidden" name='aid' value={slugs} />
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
                                                            id="first-name"
                                                            autoComplete="given-name"
                                                            value={formData.firstName}
                                                            onChange={handleForm}
                                                            required
                                                            className=" block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                {/* for showing error write proerror class */}

                                                <div className="sm:col-span-3">
                                                    <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        Last Name<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            id="last-name"
                                                            value={formData.lastName}
                                                            onChange={handleForm}
                                                            required
                                                            autoComplete="family-name"
                                                            className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="sm:col-span-3">
                                                    <label htmlFor="email" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        Street Address<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            value={formData.address1}
                                                            onChange={handleForm}
                                                            id="address1"
                                                            name="address1"
                                                            required
                                                            type="text"
                                                            autoComplete="Street"
                                                            className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        Apartment Number
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            value={formData.address2}
                                                            onChange={handleForm}
                                                            type="text"
                                                            name="address2"
                                                            id="address2"
                                                            // required
                                                            autoComplete="Apartment"
                                                            className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        City<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            value={formData.city}
                                                            onChange={handleForm}
                                                            type="text"
                                                            name="city"
                                                            required
                                                            id="City"
                                                            autoComplete="City"
                                                            className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        State<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                                                    </label>
                                                    <div className="mt-2">
                                                        <select
                                                            id="state"
                                                            name="state"
                                                            autoComplete="country-name"
                                                            className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                            onChange={handleForm}
                                                            required
                                                        >
                                                            {indianStates.map((state, index) => (
                                                                <option key={index} value={state} selected={formData.state === state}>
                                                                    {state}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        Country<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            value="United States"
                                                            type="text"
                                                            name="Country"
                                                            id="Country"
                                                            required
                                                            // onChange={handleForm}
                                                            autoComplete="Country"
                                                            className="block w-full rounded-md border-0 py-3 text-neutral-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset  focus:ring-gray-300 sm:text-base sm:leading-6"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="last-name" className="block text-sm font-normal leading-6 text-neutral-8">
                                                        Zip Code<span className=' text-base text-neutral-8 ml-0.5'>*</span>
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            value={formData.zipCode}
                                                            type="text"
                                                            name="zipCode"
                                                            id="zipCode"
                                                            onChange={handleForm}
                                                            required
                                                            autoComplete="Zip"
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
                                                Save Shipping
                                            </button>
                                            <a href="/account/shipping/" className="inline-block text-center pt-3 pb-0.5 mx-4 font-extrabold transition-colors text-green-30 w-auto mt-1 border-b-2 border-[#b1bbad]" >
                                                Cancel
                                            </a>
                                        </div>
                                        <div>
                                            {!address?.default && (
                                                <button name='remove_address' value="true" className="inline-block text-center pt-3 pb-0.5 mx-4 font-extrabold transition-colors text-green-30 w-auto mt-1 border-b-2 border-[#b1bbad]">
                                                    Remove Address
                                                </button>
                                            )}


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
                        {/* shipping right side end */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default $slug;
