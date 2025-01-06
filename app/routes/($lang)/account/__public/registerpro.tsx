import { Form, useActionData, useLoaderData } from '@remix-run/react';
import React, { ChangeEvent, useEffect, useState } from 'react'
// import { ActionData } from '../__private/edit';
import { badRequest } from 'remix-utils';
import { ActionFunction, AppLoadContext, LoaderArgs, defer } from '@shopify/remix-oxygen';
import { Customer, CustomerCreatePayload } from '@shopify/hydrogen/storefront-api-types';
// import { Resend } from 'resend';

export async function loader({ request, context, params }: LoaderArgs) {
    const customerAccessToken = await context.session.get('customerAccessToken');
    const customer = await getCustomer(context, customerAccessToken);
    const idarr = customer.id.split('Customer/');
    const myHeaders = new Headers();
    myHeaders.append(
        'X-Shopify-Access-Token',
        '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',
    );

    console.log(customer.id)

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

    return defer({
        customer,
        customerdata
    });
};

export const action: ActionFunction = async ({ request, context, params }) => {
    const { session, storefront, env } = context;
    const customerfirstName = await context.session.get('customerfirstName');
    const customerlastName = await context.session.get('customerlastName');

    const formData = await request.formData();
    // const resend = new Resend(context.env.RESEND_API_KEY);
    // const { data, error } = await resend.emails.send({
    //     from: context.env.FROM_EMAIL,
    //     to: [context.env.TO_EMAIL],
    //     subject: 'Pro Notifications',
    //     html: '<strong>It works' + formData.get('email') + '</strong>',
    // });

    const sendGridApiKey = env.SENDGRID_API_KEY;

    const sendEmail = async (
        recipientEmail,
        fullName,
        typeofbusigness,
        phoneNumber,
        taxexampt,
        companyName,
        companyAddress,
        city,
        state,
        zipCode,
        numberemployees,
        role
    ) => {
        const url = 'https://api.sendgrid.com/v3/mail/send';

        let data: any

        if (formData.get('isfile') == 'yes') {
            data = {
                personalizations: [
                    {
                        to: [
                            {
                                email: env.PRO_BENEFITS_EMAIL,
                            },
                        ],
                        subject: 'Application for Pro Benefits Email',
                    },
                ],
                content: [
                    {
                        type: 'text/html',
                        value: `
                        <p>Hello ${fullName},</p>
                        <p>Application for Pro Benefits details:</p>
                        <table border="1">
                          <tr>
                            <th>Email</th>
                            <td>${recipientEmail}</td>
                          </tr>
                          <tr>
                            <th>Full Name</th>
                            <td>${fullName}</td>
                          </tr>
                          <tr>
                            <th>Type of Business</th>
                            <td>${typeofbusigness}</td>
                          </tr>
                          <tr>
                            <th>Phone Number</th>
                            <td>${phoneNumber}</td>
                          </tr>
                          <tr>
                            <th>Tax Exempt</th>
                            <td>${taxexampt}</td>
                          </tr>
                          <tr>
                            <th>Company Name</th>
                            <td>${companyName}</td>
                          </tr>
                          <tr>
                            <th>Company Address</th>
                            <td>${companyAddress}</td>
                          </tr>
                          <tr>
                            <th>City</th>
                            <td>${city}</td>
                          </tr>
                          <tr>
                            <th>State</th>
                            <td>${state}</td>
                          </tr>
                          <tr>
                            <th>Zip Code</th>
                            <td>${zipCode}</td>
                          </tr>
                          <tr>
                            <th>Employees</th>
                            <td>${numberemployees}</td>
                          </tr>
                          <tr>
                            <th>Role</th>
                            <td>${role}</td>
                          </tr>
                        </table>
                        <p>Thanks & Regards,</p>
                        <p>Square Peg</p>
                        <p>squarepegsupply.com</p>
                      `
                    },
                ],
                from: {
                    email: env.PRO_BENEFITS_SENDER_EMAIL,
                    name: env.PRO_BENEFITS_SENDER_NAME,
                },
                attachments: [
                    {
                        content: formData.get('fileContent'),
                        filename: formData.get('taxexamptdoc'),
                        type: formData.get('fileType'),
                        disposition: 'attachment',
                        encoding: 'base64'
                    },
                ]
            };
        } else {
            data = {
                personalizations: [
                    {
                        to: [
                            {
                                email: env.PRO_BENEFITS_EMAIL,
                            },
                        ],
                        subject: 'Application for Pro Benefits Email',
                    },
                ],
                content: [
                    {
                        type: 'text/html',
                        value: `
                        <p>Hello ${fullName},</p>
                        <p>Application for Pro Benefits details:</p>
                        <table border="1">
                          <tr>
                            <th>Email</th>
                            <td>${recipientEmail}</td>
                          </tr>
                          <tr>
                            <th>Full Name</th>
                            <td>${fullName}</td>
                          </tr>
                          <tr>
                            <th>Type of Business</th>
                            <td>${typeofbusigness}</td>
                          </tr>
                          <tr>
                            <th>Phone Number</th>
                            <td>${phoneNumber}</td>
                          </tr>
                          <tr>
                            <th>Tax Exempt</th>
                            <td>${taxexampt}</td>
                          </tr>
                          <tr>
                            <th>Company Name</th>
                            <td>${companyName}</td>
                          </tr>
                          <tr>
                            <th>Company Address</th>
                            <td>${companyAddress}</td>
                          </tr>
                          <tr>
                            <th>City</th>
                            <td>${city}</td>
                          </tr>
                          <tr>
                            <th>State</th>
                            <td>${state}</td>
                          </tr>
                          <tr>
                            <th>Zip Code</th>
                            <td>${zipCode}</td>
                          </tr>
                          <tr>
                            <th>Employees</th>
                            <td>${numberemployees}</td>
                          </tr>
                          <tr>
                            <th>Role</th>
                            <td>${role}</td>
                          </tr>
                        </table>
                        <p>Thanks & Regards,</p>
                        <p>Square Peg</p>
                        <p>squarepegsupply.com</p>
                      `
                    },
                ],
                from: {
                    email: env.PRO_BENEFITS_SENDER_EMAIL,
                    name: env.PRO_BENEFITS_SENDER_NAME,
                }
            };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sendGridApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('Email sent successfully:', response);
                return true; // Return true if the email is sent successfully
            } else {
                console.error('Failed to send email:', response.statusText);
                return false; // Return false if there is an error
            }
        } catch (error) {
            console.error('Error sending email:', error);
            return false; // Return false if there is an error
        }
    };


    const email = formData.get('email');
    const password = formData.get('email');
    const firstName = customerfirstName;
    const lastName = customerlastName;


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

    const customerId = formData.get('customerId');


    // Check if the value is undefined or blank.
    let id;

    if (customerId === undefined || customerId === '') {
        const data = await storefront.mutate<{
            customerCreate: CustomerCreatePayload;
        }>(CUSTOMER_CREATE_MUTATION, {
            variables: {
                input: { email, password, firstName, lastName },
            },
        });
        console.log({ data: JSON.stringify(data) });

        id = data?.customerCreate?.customer?.id;
    } else {
        id = customerId;
    }

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
                "tax_exempt": Boolean(formData.get('isfile')),
                "addresses": [
                    {
                        "company": formData.get('companyName'),
                        "address1": formData.get('companyAddress'),
                        "city": formData.get('city'),
                        "province": formData.get('state'),
                        "zip": formData.get('zipCode'),
                        "phone": formData.get('phoneNumber'),
                    }
                ]

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
            .then((response) => response.text())
            .then((result) => {
                return result;
            })
            .catch((error) => console.log('error', error));


        // Usage
        const isMailSent = await sendEmail(
            formData.get('email'),
            customerfirstName + ' ' + customerlastName,
            formData.get('typeofbusigness'),
            formData.get('phoneNumber'),
            formData.get('isfile'),
            formData.get('companyName'),
            formData.get('companyAddress'),
            formData.get('city'),
            formData.get('state'),
            formData.get('zipCode'),
            formData.get('numberemployees'),
            formData.get('role')
        );

        const raw = JSON.stringify({
            metafield: {
                key: 'proAccount',
                value: '2',
                type: 'number_integer',
                namespace: 'arena',
            },
        });



        const resp = await fetch(
            'https://ecom-newbrand.myshopify.com/admin/api/2022-07/customers/' +
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

const registerpro = () => {
    const { customer, customerdata } = useLoaderData();

    // console.log(customerdata)

    const actionData = useActionData() || null;
    // console.log(actionData);

    if (actionData) {
        if (typeof actionData == 'boolean') {
            localStorage.setItem('pro', 'true');
            window.location.href = '/account/pro-benefits';
        } else {
            alert('somthing wrong here');
        }
    }

    const [formData, setFormData] = useState({
        companyName: '',
        companyWebsite: '',
        email: '',
        companyAddress: '',
        city: '',
        state: '',
        zipCode: '',
        phoneNumber: '',
        typeofbusigness: '',
        taxexempt: 'false',
        numberemployees: '',
        role: '',
        taxexamptdoc: null,  // New property for the selected file
        taxdocexampt: null
    });

    const customerData = JSON.parse(customerdata).customer;
    // console.log(customerData);


    useEffect(() => {

        if (customerData) {
            // setFormData.companyName = customerData?.default_address?.company;
            setFormData(prevFormData => ({
                ...prevFormData,
                email: customerData?.email,
                phoneNumber: customerData?.default_address?.phone,
            }));
        }
    }, []);


    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'file' ? e.target.files[0] : value,
        }));
    };

    const handleInputFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                // The result property contains the file content as a data URL
                const base64Content = reader.result.split(',')[1]; // Extract the base64 content


                // Access the file type
                const fileType = file.type;

                setFormData((prevData) => ({
                    ...prevData,
                    taxdocexampt: {
                        content: base64Content,
                        type: fileType,
                    },
                }));


            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }

        setFormData((prevData) => ({
            ...prevData,
            taxexamptdoc: e.target.files[0],
        }));
    }


    const handleFileClear = () => {
        setFormData((prevData) => ({
            ...prevData,
            taxexamptdoc: null,
        }));
    };
    const SHOPIFY_API_URL =
        'https://ecom-newbrand.myshopify.com/admin/api/2022-07/graphql.json';
    const SHOPIFY_ACCESS_TOKEN = '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';
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


    return (
        <div className=' bg-commonbg'>
            <div className=' text-black m-auto rounded-lg text-left transform transition-all sm:py-8 sm:align-middle sm:max-w-4xl w-full'>
                <div className="px-6 py-6 sm:pl-12 sm:pr-6 sm:py-10">
                    <div className="space-y-7">

                        <h1 className="text-2xl sm:text-[2.25rem] font-extrabold">
                            Apply for Pro Benefits
                        </h1>
                        <p className=" text-base sm:text-[1.125rem] font-normal gap-[1rem]">
                            Please provide the following information.
                        </p>

                        {/* <form onSubmit={handleSubmit} > */}
                        <div className=''>
                            <Form method="post" action="/account/registerpro" noValidate className='mr-6'>
                                <input type="hidden" name="customerId" value={customer.id} />
                                <input type="hidden" name="fileType" value={formData?.taxdocexampt?.type ? formData?.taxdocexampt?.type : ''} />
                                <input type="hidden" name="fileContent" value={formData?.taxdocexampt?.content ? formData?.taxdocexampt?.content : ''} />
                                <input type="hidden" name="isfile" value={formData.taxexempt} />

                                <div className="mb-4 mt-[1.5rem]">
                                    <label
                                        htmlFor="companyName"
                                        className="block text-sm font-normal mb-2"
                                    >
                                        Company Name<span className='text-base leading-3 text-red-700'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        placeholder="Company Name"
                                        // value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="border border-[#CDCACE] p-2 w-full rounded-md"
                                        required
                                    />
                                </div>
                                <div className="sm:flex sm:gap-[1rem]">
                                    <div className="mb-4 w-full sm:w-1/2">
                                        <label
                                            htmlFor="companyWebsite"
                                            className="block text-sm font-normal mb-2"
                                        >
                                            Company Website (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="companyWebsite"
                                            name="companyWebsite"
                                            placeholder="www.company.com"
                                            // value={formData.companyWebsite}
                                            onChange={handleInputChange}
                                            className="border border-[#CDCACE] p-2 w-full rounded-md"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 w-full sm:w-1/2">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-normal mb-2"
                                        >
                                            Email<span className='text-base leading-3 text-red-700'>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="email@company.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="border border-[#CDCACE] p-2 w-full rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="companyAddress"
                                        className="block text-sm font-normal mb-2"
                                    >
                                        Company Address<span className='text-base leading-3 text-red-700'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="companyAddress"
                                        name="companyAddress"
                                        placeholder="123 Street"
                                        value={formData.companyAddress}
                                        onChange={handleInputChange}
                                        className="border border-[#CDCACE] p-2 w-full rounded-md"
                                        required
                                    />
                                </div>
                                <div className="sm:flex sm:gap-[1rem]">
                                    <div className="mb-4 w-full sm:w-1/2">
                                        <label
                                            htmlFor="city"
                                            className="block text-sm font-normal mb-2"
                                        >
                                            City<span className='text-base leading-3 text-red-700'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="border border-[#CDCACE] p-2 w-full rounded-md"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 w-full sm:w-1/2">
                                        <label
                                            htmlFor="state"
                                            className="block text-sm font-normal mb-2"
                                        >
                                            State<span className='text-base leading-3 text-red-700'>*</span>
                                        </label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="border border-[#CDCACE] p-2 w-full rounded-md"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select State<span className='text-base leading-3 text-red-700'>*</span>
                                            </option>
                                            {indianStates.map((state, index) => (
                                                <option key={index} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:flex sm:gap-[1rem]">
                                    <div className="mb-4 w-full sm:w-1/2">
                                        <label
                                            htmlFor="zipCode"
                                            className="block text-sm font-normal mb-2"
                                        >
                                            Zip Code<span className='text-base leading-3 text-red-700'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            placeholder="01234"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="border border-[#CDCACE] p-2 w-full rounded-md"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 w-full sm:w-1/2">
                                        <label
                                            htmlFor="phoneNumber"
                                            className="block text-sm font-normal mb-2"
                                        >
                                            Phone Number<span className='text-base leading-3 text-red-700'>*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            placeholder="123-456-7890"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="border border-[#CDCACE] p-2 w-full rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="businessType"
                                        className="block text-sm font-normal mb-2"
                                    >
                                        Type of Business (Optional)
                                    </label>
                                    <div className="sm:flex sm:gap-[1rem]">
                                        <div className="w-full sm:w-1/2">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="typeofbusigness"
                                                        value="hvac"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; HVAC
                                                </label>
                                            </div>
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="typeofbusigness"
                                                        value="plumbing"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; Plumbing
                                                </label>
                                            </div>
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="typeofbusigness"
                                                        value="mechanicalcontractor"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; Mechanical Contractor
                                                </label>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="typeofbusigness"
                                                        value="generalcontractor"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; General Contractor
                                                </label>
                                            </div>
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="typeofbusigness"
                                                        value="electrical"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; Electrical
                                                </label>
                                            </div>
                                            {/* Add similar blocks for other radio options */}
                                            <div className="flex items-center gap-[1rem] p-[0.5rem] pr-0">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="typeofbusigness"
                                                        value={formData.typeofbusigness}
                                                    />
                                                </label>
                                                <input
                                                    type="text"
                                                    id="companyName"
                                                    placeholder="Other"
                                                    name="typeofbusigness"
                                                    onChange={handleInputChange}
                                                    className="border border-[#CDCACE] p-2 w-full rounded-md"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="YesOrNo"
                                        className="block text-sm font-normal mb-2"
                                    >
                                        Tax exempt: Yes or No?<span className='text-base leading-3 text-red-700'>*</span>
                                    </label>
                                    <div className="sm:flex sm:gap-[1rem]">
                                        <div className="w-full">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="taxexempt"
                                                        value="yes"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; Yes
                                                </label>
                                            </div>


                                            <div className={formData.taxexempt === 'yes' ? 'block' : 'hidden'}>
                                                <div id="drop-area" className={`border-dashed border border-gray-300 p-4 rounded-md ${formData.taxexamptdoc ? 'block' : 'hidden'}`}>
                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-center">
                                                            <p className="text-gray-700 mr-2">{formData?.taxexamptdoc?.name}</p>
                                                            <button className="text-black-700 cursor-pointer" onClick={handleFileClear}>
                                                                <span className='text-2xl border rounded-md px-2 h-[20px] border-black'>&times;</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${formData.taxexamptdoc ? 'hidden' : 'block'}`}>
                                                    <p className="text-gray-900 text-sm">Please upload your Sales Tax Exemption certificate</p>
                                                    <div id="drop-area" className="border-dashed border border-gray-300 p-4 rounded-md">
                                                        <div className="flex justify-center items-center">
                                                            <div className="text-center">
                                                                <label htmlFor="fileInput" className="cursor-pointer">
                                                                    <span className="text-gray-700 mr-2">Drag and drop files here or</span>
                                                                    <span className="text-gray-500 border rounded border-gray-500 py-0.5 px-2.5 font-bold">Browse</span>
                                                                    <input type="file" id="fileInput" name="taxexamptdoc" className="hidden" onChange={handleInputFileChange} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="taxexempt"
                                                        value="no"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; No
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="NumberOfEmployees"
                                        className="block text-sm font-normal mb-2"
                                    >
                                        Number of employees<span className='text-base leading-3 text-red-700'>*</span>
                                    </label>
                                    <div className="sm:flex sm:gap-[1rem]">
                                        <div className="w-full sm:w-1/2">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="numberemployees"
                                                        value="0-10"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; 0-10
                                                </label>
                                            </div>
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="numberemployees"
                                                        value="11-100"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; 11-100
                                                </label>
                                            </div>
                                            {/* Add similar blocks for other radio options */}
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input type="radio" name="numberemployees" value="101-500" onChange={handleInputChange} />
                                                    &nbsp; 101-500

                                                </label>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="numberemployees"
                                                        value="501-1000"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; 501-1000
                                                </label>
                                            </div>
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="numberemployees"
                                                        value="1001+"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; 1001+
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="Role"
                                        className="block text-sm font-normal mb-2"
                                    >
                                        Role<span className='text-base leading-3 text-red-700'>*</span>
                                    </label>
                                    <div className="sm:flex sm:gap-[1rem]">
                                        <div className="w-full sm:w-1/2">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="purchaser"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; Purchaser
                                                </label>
                                            </div>
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input type="radio" name="role" value="manager" onChange={handleInputChange} />
                                                    &nbsp; Manager
                                                </label>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2">
                                            <div className="p-[0.5rem]">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="owner"
                                                        onChange={handleInputChange}
                                                    />
                                                    &nbsp; Owner
                                                </label>
                                            </div>
                                            {/* Add similar blocks for other radio options */}
                                            <div className="flex items-center gap-[1rem] p-[0.5rem] pr-0">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                    />
                                                </label>
                                                <input
                                                    type="text"
                                                    id="companyName"
                                                    name="role"
                                                    placeholder="Other"

                                                    onChange={handleInputChange}
                                                    className="border border-[#CDCACE] p-2 w-full rounded-md "
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex justify-center items-center'>
                                        <button
                                            type="submit"
                                            className="w-full h-[3rem] bg-[#446039] text-[#ffffff] text-base font-extrabold text-center rounded-[5rem] mt-[2.25rem]"
                                        >
                                            Submit Pro Benefits Application
                                        </button>
                                    </div>
                                </div>
                                {/* </form> */}
                            </Form>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default registerpro;


export const CUSTOMER_QUERY = `#graphql
  query CustomerDetails(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
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

    const datas = await storefront.query<{
        customer: Customer;
    }>(CUSTOMER_QUERY, {
        variables: {
            customerAccessToken,

        },
        cache: storefront.CacheNone(),
    });


    return datas.customer;
}

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
