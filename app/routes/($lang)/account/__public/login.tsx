import {
  json,
  redirect,
  type MetaFunction,
  type ActionFunction,
  type AppLoadContext,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useMatches,
} from '@remix-run/react';
import { Suspense, useState } from 'react';
import { getInputStyleClasses } from '~/lib/utils';
import { Button, Heading, Link, Text } from '~/components';
import type { CustomerAccessTokenCreatePayload } from '@shopify/hydrogen/storefront-api-types';
import { TextField } from '~/components/Input';
import { TextLink } from '~/components/Link';

export const handle = {
  isPublic: true,
};

export async function loader({ context, params }: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  // TODO: Query for this?
  return json({ shopName: 'Hydrogen' });
}

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  const { session, storefront } = context;

  try {
    const customerAccessToken = await doLogin(context, { email, password });
    session.set('customerAccessToken', customerAccessToken);

    return redirect(params.lang ? `/${params.lang}/account` : '/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: any) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formError:
        'Sorry. We did not recognize either your email or password. Please try to sign in again or create a new account.',
    });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: 'Login',
  };
};

export default function Login() {
  const { shopName } = useLoaderData<typeof loader>();
  const [root] = useMatches();

  const actionData = useActionData<ActionData>();

  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-xl w-full">
        <Heading className="text-4xl mb-6">Login</Heading>
        <p className="mb-8 text-base lg:text-[18px] leading-6 lg:leading-7">
          Welcome back! Please sign in to continue.
        </p>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form method="post" noValidate className="space-y-4">
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">{actionData.formError}</p>
            </div>
          )}
          <div>
            <TextField
              label="Email Address"
              // className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              type="email"
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
          <div className="relative">
            <TextField
              className="mt-4"
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-label="Password"
              minLength={8}
              required
              error={nativePasswordError}
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativePasswordError(null);
                } else {
                  setNativePasswordError(
                    event.currentTarget.validity.valueMissing
                      ? 'Please enter a password'
                      : 'Passwords must be at least 8 characters',
                  );
                }
              }}
            />
            <TextLink
              className="absolute top-1 right-0 text-xs font-bold text-brand underline"
              to="/account/recover"
            >
              Forgot Password?
            </TextLink>
          </div>

          {/* login / create account group */}
          <div className="flex flex-col gap-[30px]">
            <Button width="full" type="submit" className="mt-6">
              Login
            </Button>

            <div className="relative">
              <hr className="border-neutral-44" />
              <span className="absolute -translate-y-1/2 inset-x-0 px-4 mx-auto text-center bg-white w-[281px] lg:w-[313px] text-base lg:text-[18px] leading-6 lg:leading-7 whitespace-nowrap">
                Don&apos;t have a SquarePeg Account?
              </span>
            </div>

            <div>
              <Link to="/account/register" className="w-full mt-[30px] ">
                <Button
                  as="span"
                  width="full"
                  type="submit"
                  variant="secondary"
                >
                  Create an Account
                </Button>
              </Link>
            </div>
          </div>
        </Form>
        {/* <Suspense fallback={<></>}>
          <Await resolve={root.data?.cart}>
            {(cart) => (
              <>
                <Heading className="text-4xl">Guest Checkout</Heading>
                <a href={cart.checkoutUrl} target="_self">
                  <Button
                    className="mb-8 mt-6"
                    as="span"
                    width="full"
                    variant="secondary"
                  >
                    Continue to Checkout
                  </Button>
                </a>
              </>
            )}
          </Await>
        </Suspense> */}
      </div>
    </div>
  );
}

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
