import type {Customer} from '@shopify/hydrogen/storefront-api-types';
import {Button, Heading, Link} from '~/components';

export function AccountDetails({customer}: {customer: Customer}) {
  const {firstName, lastName, email, phone} = customer;

  return (
    <div className="grid w-full gap-4 py-6 md:gap-8 md:py-8 lg:py-12">
      <Heading>Account Details</Heading>
      <div className="lg:p-8 p-6 border border-gray-200 rounded-3xl bg-white">
        <p className="font-bold mb-2">
          {firstName || lastName
            ? (firstName ? firstName + ' ' : '') + lastName
            : 'Add name'}{' '}
        </p>
        <dl>
          <div className="flex">
            <dt>Email:&nbsp;</dt>
            <dd>{email}</dd>
          </div>
          <div className="flex">
            <dt>Phone:&nbsp;</dt>
            <dd>{phone}</dd>
          </div>
          <div className="flex">
            <dt>Password:&nbsp;</dt>
            <dd>**************</dd>
          </div>
        </dl>
      </div>
      <Link prefetch="intent" to="/account/edit">
        <Button>Edit</Button>
      </Link>
    </div>
  );
}
