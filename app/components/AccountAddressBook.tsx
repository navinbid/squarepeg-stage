import {Form, useFetcher} from '@remix-run/react';
import type {
  Customer,
  MailingAddress,
} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import {Button, Heading, Link, Section, Text} from '~/components';

export function AccountAddressBook({
  customer,
  addresses,
}: {
  customer: Customer;
  addresses: MailingAddress[];
}) {
  return (
    <div className="grid w-full gap-4 py-6 md:gap-8 md:py-8 lg:py-12">
      <Heading>Shipping Address</Heading>
      <div>
        {!addresses?.length && (
          <Text className="mb-1" size="fine" width="narrow" as="p">
            No Addresses saved
          </Text>
        )}
        {Boolean(addresses?.length) && (
          <div className="grid grid-cols-1 gap-6">
            {customer.defaultAddress && (
              <Address address={customer.defaultAddress} defaultAddress />
            )}
            {addresses
              .filter((address) => address.id !== customer.defaultAddress?.id)
              .map((address) => (
                <Address key={address.id} address={address} />
              ))}
          </div>
        )}
      </div>
      <div className="w-48">
        <Button
          to="address/add"
          className="mt-2 text-sm w-full mb-6"
          variant="primary"
        >
          Add Address
        </Button>
      </div>
    </div>
  );
}

function Address({
  address,
  defaultAddress,
}: {
  address: MailingAddress;
  defaultAddress?: boolean;
}) {
  const fetcher = useFetcher();
  return (
    <div className="bg-white lg:p-8 p-6 border border-gray-200 rounded-3xl flex flex-col relative">
      {defaultAddress && (
        <span className="absolute top-8 right-8 px-4 py-2 text-xs font-medium rounded-full bg-primary/20 text-neutral-8">
          Default
        </span>
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li className="font-bold mb-2">
            {'' +
              (address.firstName && address.firstName + ' ') +
              address?.lastName}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line: string) => <li key={line}>{line}</li>)}
      </ul>

      <div className="flex flex-row mt-6 items-baseline divide-x font-bold text-sm ">
        {!defaultAddress && (
          <fetcher.Form action="address/default" method="put">
            <input type="hidden" name="action" value="MAKE_DEFAULT" />
            <input type="hidden" name="addressId" value={address.id} />
            <button type="submit" className="pr-3">
              Make Default
            </button>
          </fetcher.Form>
        )}
        <Link
          to={`/account/address/${encodeURIComponent(address.id)}`}
          className={clsx('px-3', defaultAddress && 'pl-0')}
          prefetch="intent"
        >
          Edit
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button className="pl-3">Remove</button>
        </Form>
      </div>
    </div>
  );
}
