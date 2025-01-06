import {
  type MetaFunction,
  redirect,
  json,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import { Form, useActionData } from '@remix-run/react';
import { useState } from 'react';
import { getInputStyleClasses } from '~/lib/utils';
import { Button, Heading, Link } from '~/components';
import { doLogin } from './login';
import type { CustomerCreatePayload } from '@shopify/hydrogen/storefront-api-types';
import { TextField } from '~/components/Input';
import { TextLink } from '~/components/Link';
import { KLAVIYO_API_BASE } from '~/lib/const';

export async function loader({ context, params }: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, context, params }) => {
  const { session, storefront } = context;
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const pro = formData.get('pro');
  const klaviyo_signup = formData.get('klaviyo_signup');

  const checkPasswordValidity = (pass) => {
    const hasMinLength = pass.length >= 8;
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasCapitalLetter = /[A-Z]/.test(pass);
    return hasMinLength && hasSpecialCharacter && hasCapitalLetter;
  };


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


  if (checkPasswordValidity(password) == false) {
    return badRequest({
      formError: 'Password must contain a capital letter and a special character.',
    });
  }



  if (password != formData.get("verify-password")) {
    return badRequest({
      formError: 'Password and Verify Password does not match.',
    });
  }

  try {

    let acceptsMarketing = false;

    if (klaviyo_signup == "on") {
      acceptsMarketing = true
    }

    const data = await storefront.mutate<{
      customerCreate: CustomerCreatePayload;
    }>(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: { email, password, firstName, lastName, acceptsMarketing },
      },
    });
    console.log({ data: JSON.stringify(data) });

    if (!data?.customerCreate?.customer?.id) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerCreate?.customerUserErrors[0]?.message, {
        cause: {
          message: data?.customerCreate?.customerUserErrors[0]?.message,
        },
      });
    }

    const customerAccessToken = await doLogin(context, { email, password });
    session.set('customerAccessToken', customerAccessToken);
    session.set('customerfirstName', firstName);
    session.set('customerlastName', lastName);
    if (pro == "on") {
      return redirect(params.lang ? `${params.lang}/account/registerpro` : '/account/registerpro', {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    } else {
      return redirect(params.lang ? `${params.lang}/account` : '/account', {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    }
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
      formError: error?.cause?.message || 'An error occurred.',
    });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: 'Register',
  };
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativeFirstNameError, setNativeFirstNameError] = useState<
    null | string
  >(null);
  const [nativeLastNameError, setNativeLastNameError] = useState<null | string>(
    null,
  );
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-xl w-full">
        <Heading className="text-4xl mb-6">Create An Account</Heading>
        <p className="mb-8 text-base lg:text-[18px] leading-6 lg:leading-7">
          Creating an account lets you easily track purchases, create lists of
          favorite products, and more.
        </p>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="post"
          noValidate
          className="pt-6 pb-8 mt-4 mb-4 space-y-6"
        >
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">{actionData.formError}</p>
            </div>
          )}
          <div>
            <TextField
              className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              label="Email Address"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              className={`mb-1`}
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              autoComplete="given-name"
              required
              error={nativeFirstNameError}
              onBlur={(event) => {
                setNativeFirstNameError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid first name'
                    : null,
                );
              }}
            />
            <TextField
              className={`mb-1`}
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              autoComplete="family-name"
              required
              aria-label="Last Name"
              error={nativeLastNameError}
              onBlur={(event) => {
                setNativeLastNameError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid last name'
                    : null,
                );
              }}
            />
          </div>
          <div>
            <TextField
              className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
              id="password"
              name="password"
              label="Password"
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
          </div>
          <div>
            <TextField
              className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
              id="verify-password"
              name="verify-password"
              label="Verify Password"
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
          </div>
          {/*  */}
          <div className="applypro99 flex justify-start items-center">
            <input
              id="klaviyo_signup"
              aria-describedby="candidates-description"
              name="klaviyo_signup"
              type="checkbox"

              className="h-4 w-4 rounded border-2 border-neutral-8 bg-transparent text-black focus:ring-0 focus:ring-transparent focus:ring-offset-0"
              defaultChecked
            ></input>
            <label
              htmlFor="klaviyo_signup"
              className="select-none ml-3 cursor-pointer font-bold text-gray-900"
            >
              Email me with news and offers

            </label>
          </div>
          {/*  */}
          {/*  */}
          <div className="mb-4 mt-[1.5rem]">
            <div className="applypro">
              <input
                id="pro"
                aria-describedby="candidates-description"
                name="pro"
                type="checkbox"

                className="h-4 w-4 rounded border-2 border-neutral-8 bg-transparent text-black focus:ring-0 focus:ring-transparent focus:ring-offset-0"

              ></input>
              <label
                htmlFor="pro"
                className="select-none ml-3 cursor-pointer font-bold text-gray-900"
              >
                Apply for{' '}

                <span className=" underline font-semibold"><Link to="/pro">Pro Benefits</Link></span>

              </label>
            </div>
          </div>
          {/*  */}
          <div className="flex items-center justify-between">
            <Button variant="primary" type="submit" className="w-full mt-6">
              Create Account
            </Button>
          </div>
          <div className="flex justify-center items-center mt-8  border-gray-300">
            <TextLink
              className="underline underline-offset-4 font-extrabold text-brand"
              to="/account/login"
            >
              Already have an account?
            </TextLink>
          </div>
        </Form>
      </div>
    </div>
  );
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
      lastName
      email
      phone
      acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;