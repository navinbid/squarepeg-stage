import React, { useState, useEffect } from 'react';

import { ActionFunction, AppLoadContext, LoaderArgs, LoaderFunction, defer, redirect } from '@shopify/remix-oxygen';
// import {useForm} from 'remix';
import { badRequest } from 'remix-utils';
import { Customer, CustomerCreatePayload } from '@shopify/hydrogen/storefront-api-types';
import { doLogin } from '~/routes/($lang)/account/__public/login';
import { ActionData } from '~/routes/($lang)/api/promo';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { string } from 'prop-types';

// export async function loader({ request, context, params }: LoaderArgs) {
//   const customerAccessToken = await context.session.get('customerAccessToken');
//   const customer = await getCustomer(context, customerAccessToken);
//   const idarr = customer.id.split('Customer/');
//   const myHeaders = new Headers();
//   myHeaders.append(
//     'X-Shopify-Access-Token',
//     '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',
//   );
//   myHeaders.append('Content-Type', 'application/json');
//   const customerdata = await fetch(
//     `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07//customers/${idarr[1]}.json`,
//     {
//       headers: myHeaders,
//     },
//   )
//     .then((response) => response.text())
//     .then((result) => {
//       return result;
//     });

//   console.log(customerdata)


//   return defer({
//     customerdata,
//   });
// }

function ProForm({ onClose }) {

  // const { customerdata } = useLoaderData();
  // console.log(customerdata);
  // sessionStorage.setItem('customerdata', customerdata)

  const actionData = useActionData<ActionData>() || null;

  console.log(actionData);
  if (actionData) {
    if (typeof actionData == 'boolean') {
      localStorage.setItem('pro', 'true');
      window.location.href = '/account/pro-benefits';
    } else {
      alert('somthing wrong here');
    }
  }

  const [formData, setFormData] = useState({
    customerId: '',
    companyName: '',
    companyWebsite: '',
    email: '',
    companyAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    typeofbusigness: '',
    taxexempt: '',
    numberemployees: '',
    role: '',
    taxexamptdoc: null,  // New property for the selected file
  });

  const data = sessionStorage.getItem('customerdata');
  const customerData = JSON.parse(data).customer;


  useEffect(() => {
    if (customerData) {
      // setFormData.companyName = customerData?.default_address?.company;
      setFormData(prevFormData => ({
        ...prevFormData,
        companyName: customerData?.default_address?.company,
        email: customerData?.email,
        companyAddress: customerData?.default_address?.address1,
        city: customerData?.default_address?.city,
        state: customerData?.default_address?.province,
        phoneNumber: customerData?.addresses[0]?.phone,
        zipCode: customerData?.default_address?.zip,



      }));
    }
  }, []);


  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {

      if (file.size > 1 * 1024 * 1024) {
        alert('File size should be less than 1 MB');
        return false; // Stop further processing
      }
      const reader = new FileReader();

      reader.onloadend = () => {
        // The result property contains the file content as a data URL
        const base64Content = reader.result.split(',')[1]; // Extract the base64 content


        // Access the file type
        const fileType = file.type;
        const fileName = file.name;

        setFormData((prevData) => ({
          ...prevData,
          taxexamptdoc: {
            content: base64Content,
            type: fileType,
            name: fileName
          },
        }));

      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    }

    setFormData((prevData) => ({
      ...prevData,
      taxexamptdoc: file,
    }));


  }


  const handleFileClear = () => {
    setFormData((prevData) => ({
      ...prevData,
      taxexamptdoc: null,
    }));

    console.log(formData.taxexamptdoc)
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
  const cid = sessionStorage.getItem('cid') || '';
  // console.log(formData);



  return (
    <div className="px-6 py-6 sm:pl-12 sm:pr-6 sm:py-10">
      <div className="space-y-7">
        <div className="absolute right-7 top-7 cursor-pointer">
          <svg width="32" height="32" onClick={onClose} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#160E1B" />
            <path d="M22.6673 10.5083L21.4923 9.33325L16.0007 14.8249L10.509 9.33325L9.33398 10.5083L14.8257 15.9999L9.33398 21.4916L10.509 22.6666L16.0007 17.1749L21.4923 22.6666L22.6673 21.4916L17.1757 15.9999L22.6673 10.5083Z" fill="#160E1B" />
          </svg>

        </div>
        <h1 className="text-2xl sm:text-[2.25rem] font-extrabold">
          Apply for Pro Benefits
        </h1>
        <p className=" text-base sm:text-[1.125rem] font-normal gap-[1rem]">
          Please provide the following information.
        </p>

        {/* <form onSubmit={handleSubmit} > */}
        <div className='h-auto sm:h-[640px] overflow-auto probenefitspop'>
          <Form method="post" action="/pro" className='mr-6'>
            <input type="hidden" name="customerId" value={cid} />
            <input type="hidden" name="customerFullName" value={customerData?.first_name + ' ' + customerData?.last_name} />
            <input type="hidden" name="fileType" value={formData?.taxexamptdoc?.type ? formData?.taxexamptdoc?.type : ''} />
            <input type="hidden" name="fileContent" value={formData?.taxexamptdoc?.content ? formData?.taxexamptdoc?.content : ''} />
            <div className="mb-4 mt-[1.5rem]">
              <label
                htmlFor="companyName"
                className="block text-sm font-normal mb-2"
              >
                Company Name<span className='text-base leading-3 text-neutral-8'>*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
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
                  Company Website (optional)
                </label>
                <input
                  type="text"
                  id="companyWebsite"
                  name="companyWebsite"
                  placeholder="www.company.com"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  className="border border-[#CDCACE] p-2 w-full rounded-md"
                />
              </div>

              <div className="mb-4 w-full sm:w-1/2">
                <label
                  htmlFor="email"
                  className="block text-sm font-normal mb-2"
                >
                  Email<span className='text-base leading-3 text-neutral-8'>*</span>
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
                Company Address<span className='text-base leading-3 text-neutral-8'>*</span>
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
                  City<span className='text-base leading-3 text-neutral-8'>*</span>
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
                  State<span className='text-base leading-3 text-neutral-8'>*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  // value={formData.state}
                  onChange={handleInputChange}
                  className="border border-[#CDCACE] p-2 w-full rounded-md"
                  required
                >
                  <option value="" disabled>
                    Select State<span className='text-base leading-3 text-neutral-8'>*</span>
                  </option>
                  {indianStates.map((state, index) => (
                    <option key={index} value={state} selected={formData.state === state}>
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
                  Zip Code<span className='text-base leading-3 text-neutral-8'>*</span>
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
                  Phone Number<span className='text-base leading-3 text-neutral-8'>*</span>
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
                Type of Business (optional)
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
                Tax exempt: Yes or No?<span className='text-base leading-3 text-neutral-8'>*</span>
              </label>
              <div className="sm:flex sm:gap-[1rem]">
                <div className="w-full">
                  <div className="p-[0.5rem]">
                    <label>
                      <input
                        type="radio"
                        name="taxexempt"
                        value="true"
                        onChange={handleInputChange}
                        required
                      />
                      &nbsp; Yes
                    </label>
                  </div>

                  <div className={formData.taxexempt === 'true' ? 'block' : 'hidden'}>
                    <div id="drop-area" className={`border-dashed border border-gray-300 p-4 rounded-md ${formData.taxexamptdoc != null ? 'block' : 'hidden'}`}>
                      <div className="mt-2">
                        <div className="flex items-center justify-center">
                          <p className="text-gray-700 mr-2">{formData?.taxexamptdoc?.name}</p>
                          <div className="text-black-700 cursor-pointer" onClick={handleFileClear}>
                            <span className='text-2xl border rounded-md px-2 h-[20px] border-black'>&times;</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${formData.taxexamptdoc != null ? 'hidden' : 'block'}`}>
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
                        value="false"
                        onChange={handleInputChange}
                        required
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
                Number of employees<span className='text-base leading-3 text-neutral-8'>*</span>
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
                        required
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
                        required
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
                        required
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
                        required
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
                Role<span className='text-base leading-3 text-neutral-8'>*</span>
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
                        required
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
                        required
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
                        required
                      />
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="role"
                      placeholder="Other"

                      onChange={handleInputChange}
                      className="border border-[#CDCACE] p-2 w-full rounded-md "
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-center items-center'>
                <button
                  type="submit"
                  className="w-full h-[3rem] bg-[#446039] text-[#ffffff] text-base font-extrabold text-center rounded-[5rem] mt-[2.25rem]"
                >
                  Submit My Application
                </button>
              </div>
            </div>
            {/* </form> */}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ProForm;
