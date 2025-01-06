import {
  json,
  redirect,
  type MetaFunction,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {Form, useActionData} from '@remix-run/react';
import {useState} from 'react';
import {Button, Heading, Link} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';
import type {CustomerRecoverPayload} from '@shopify/hydrogen/storefront-api-types';
import {TextField} from '~/components/Input';
import {TextLink} from '~/components/Link';

export const handle = {
  seo: {
    title: 'Password Reset | Square Peg',
  },
};

export async function loader({context, params}: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
  resetRequested?: boolean;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return badRequest({
      formError: 'Please provide an email.',
    });
  }

  try {
    await context.storefront.mutate<{
      customerRecover: CustomerRecoverPayload;
    }>(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error: any) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: 'Recover Password',
  };
};

export default function Recover() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const isSubmitted = actionData?.resetRequested;

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-xl w-full">
        {isSubmitted ? (
          <>
            <Heading className="text-4xl mb-6">Request Sent.</Heading>
            <p className="mb-8 text-base lg:text-[18px] leading-6 lg:leading-7">
              If that email address is in our system, you will receive an email
              with instructions about how to reset your password in a few
              minutes.
            </p>
          </>
        ) : (
          <>
            <Heading className="text-4xl mb-6">Reset Your Password</Heading>
            <p className="mb-8 text-base lg:text-[18px] leading-6 lg:leading-7">
              Enter the email address associated with your account to receive a
              link to reset your password.
            </p>
            {/* TODO: Add onSubmit to validate _before_ submission with native? */}
            <Form
              method="post"
              noValidate
              className="pt-6 pb-8 mt-4 mb-4 space-y-3"
            >
              {actionData?.formError && (
                <div className="flex items-center justify-center mb-6 bg-zinc-500">
                  <p className="m-4 text-s text-contrast">
                    {actionData.formError}
                  </p>
                </div>
              )}
              <div>
                <TextField
                  className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  required
                  aria-label="Email address"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  error={nativeEmailError}
                  onBlur={(event) => {
                    setNativeEmailError(
                      event.currentTarget.value.length &&
                        !event.currentTarget.validity.valid
                        ? 'Invalid email address'
                        : null,
                    );
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button className="w-full mt-6" type="submit">
                  Request Reset Link
                </Button>
              </div>
              <div className="flex justify-center items-center mt-8">
                <TextLink
                  className="underline underline-offset-4 font-extrabold text-brand"
                  to="/account/login"
                >
                  Return to Login
                </TextLink>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
