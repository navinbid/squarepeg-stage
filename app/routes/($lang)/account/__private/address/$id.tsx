import {json, redirect, type ActionFunction} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useOutletContext,
  useParams,
  useTransition,
} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {
  MailingAddressInput,
  CustomerAddressUpdatePayload,
  CustomerAddressDeletePayload,
  CustomerDefaultAddressUpdatePayload,
  CustomerAddressCreatePayload,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {Button, Text} from '~/components';
import {assertApiErrors, getInputStyleClasses} from '~/lib/utils';
import type {AccountOutletContext} from '../edit';
import {TextField} from '~/components/Input';

interface ActionData {
  formError?: string;
}

const badRequest = (data: ActionData) => json(data, {status: 400});

export const handle = {
  renderInModal: true,
};

export const action: ActionFunction = async ({request, context, params}) => {
  const {storefront, session} = context;
  const formData = await request.formData();

  const customerAccessToken = await session.get('customerAccessToken');
  invariant(customerAccessToken, 'You must be logged in to edit your account.');

  const addressId = formData.get('addressId');
  const action = formData.get('action');
  invariant(typeof addressId === 'string', 'You must provide an address id.');

  if (action === 'MAKE_DEFAULT') {
    const data = await storefront.mutate<{
      customerDefaultAddressUpdate: CustomerDefaultAddressUpdatePayload;
    }>(UPDATE_DEFAULT_ADDRESS_MUTATION, {
      variables: {customerAccessToken, addressId},
    });
    assertApiErrors(data.customerDefaultAddressUpdate);
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }
  if (request.method === 'DELETE') {
    try {
      const data = await storefront.mutate<{
        customerAddressDelete: CustomerAddressDeletePayload;
      }>(DELETE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, id: addressId},
      });

      assertApiErrors(data.customerAddressDelete);

      return redirect(params.lang ? `${params.lang}/account` : '/account');
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  }

  const address: MailingAddressInput = {};

  const keys: (keyof MailingAddressInput)[] = [
    'lastName',
    'firstName',
    'address1',
    'address2',
    'city',
    'province',
    'country',
    'zip',
    'phone',
    'company',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      address[key] = value;
    }
  }

  const defaultAddress = formData.get('defaultAddress');

  if (addressId === 'add') {
    try {
      const data = await storefront.mutate<{
        customerAddressCreate: CustomerAddressCreatePayload;
      }>(CREATE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, address},
      });

      assertApiErrors(data.customerAddressCreate);

      const newId = data.customerAddressCreate?.customerAddress?.id;
      invariant(newId, 'Expected customer address to be created');

      if (defaultAddress) {
        const data = await storefront.mutate<{
          customerDefaultAddressUpdate: CustomerDefaultAddressUpdatePayload;
        }>(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {customerAccessToken, addressId: newId},
        });

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return redirect(params.lang ? `${params.lang}/account` : '/account');
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  } else {
    try {
      const data = await storefront.mutate<{
        customerAddressUpdate: CustomerAddressUpdatePayload;
      }>(UPDATE_ADDRESS_MUTATION, {
        variables: {
          address,
          customerAccessToken,
          id: decodeURIComponent(addressId),
        },
      });

      assertApiErrors(data.customerAddressUpdate);

      if (defaultAddress) {
        const data = await storefront.mutate<{
          customerDefaultAddressUpdate: CustomerDefaultAddressUpdatePayload;
        }>(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {
            customerAccessToken,
            addressId: decodeURIComponent(addressId),
          },
        });

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return redirect(params.lang ? `${params.lang}/account` : '/account');
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  }
};

export default function EditAddress() {
  const {id: addressId} = useParams();
  const isNewAddress = addressId === 'add';
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const {customer} = useOutletContext<AccountOutletContext>();
  const addresses = flattenConnection(customer.addresses);
  const defaultAddress = customer.defaultAddress;
  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  const normalizedAddress = decodeURIComponent(addressId ?? '').split('?')[0];
  const address = addresses.find((address) =>
    address.id!.startsWith(normalizedAddress),
  );

  return (
    <>
      <Text className="mt-4 mb-6" as="h3" size="lead">
        {isNewAddress ? 'Add address' : 'Edit address'}
      </Text>
      <Form method="post" className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <input
          type="hidden"
          name="addressId"
          value={address?.id ?? addressId}
        />
        {actionData?.formError && (
          <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
            <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
          </div>
        )}
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="firstName"
            name="firstName"
            label="First Name"
            required
            type="text"
            autoComplete="given-name"
            aria-label="First name"
            defaultValue={address?.firstName ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="lastName"
            name="lastName"
            label="Last Name"
            required
            type="text"
            autoComplete="family-name"
            aria-label="Last name"
            defaultValue={address?.lastName ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="company"
            name="company"
            label="Company"
            type="text"
            autoComplete="organization"
            aria-label="Company"
            defaultValue={address?.company ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="address1"
            name="address1"
            label="Address Line 1"
            type="text"
            autoComplete="address-line1"
            required
            aria-label="Address line 1"
            defaultValue={address?.address1 ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="address2"
            name="address2"
            label="Address Line 2"
            type="text"
            autoComplete="address-line2"
            aria-label="Address line 2"
            defaultValue={address?.address2 ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="city"
            name="city"
            label="City"
            type="text"
            required
            autoComplete="address-level2"
            aria-label="City"
            defaultValue={address?.city ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="province"
            name="province"
            label="State or Province"
            type="text"
            autoComplete="address-level1"
            required
            aria-label="State"
            defaultValue={address?.province ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="zip"
            name="zip"
            label="Zip Code"
            type="text"
            autoComplete="postal-code"
            required
            aria-label="Zip"
            defaultValue={address?.zip ?? ''}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="country"
            name="country"
            label="Country"
            type="text"
            autoComplete="country-name"
            required
            aria-label="Country"
            defaultValue={address?.country ?? 'US'}
          />
        </div>
        <div className="mt-3">
          <TextField
            className={getInputStyleClasses()}
            id="phone"
            name="phone"
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            aria-label="Phone"
            defaultValue={address?.phone ?? ''}
            mask="+19999999999"
          />
        </div>
        <div className="mt-4 col-span-full">
          <input
            type="checkbox"
            name="defaultAddress"
            id="defaultAddress"
            defaultChecked={defaultAddress?.id === address?.id}
            className="border-gray-500 rounded-sm cursor-pointer border-1"
          />
          <label
            className="inline-block ml-2 text-sm cursor-pointer"
            htmlFor="defaultAddress"
          >
            Set as default address
          </label>
        </div>
        <div className="mt-4 lg:mt-8">
          <Button
            className="w-full rounded focus:shadow-outline"
            type="submit"
            variant="primary"
            disabled={transition.state !== 'idle'}
          >
            {transition.state !== 'idle' ? 'Saving' : 'Save'}
          </Button>
        </div>
        <div className="mt-4 lg:mt-8">
          <Button
            to=".."
            className="w-full rounded focus:shadow-outline"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </>
  );
}

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
    $id: ID!
  ) {
    customerAddressUpdate(
      address: $address
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      customerUserErrors {
        code
        field
        message
      }
      deletedCustomerAddressId
    }
  }
`;

const UPDATE_DEFAULT_ADDRESS_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate(
    $addressId: ID!
    $customerAccessToken: String!
  ) {
    customerDefaultAddressUpdate(
      addressId: $addressId
      customerAccessToken: $customerAccessToken
    ) {
      customer {
        id
        addresses(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
  ) {
    customerAddressCreate(
      address: $address
      customerAccessToken: $customerAccessToken
    ) {
      customerAddress {
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
