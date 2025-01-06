import {
  json,
  redirect,
  type MetaFunction,
  type ActionFunction,
} from '@shopify/remix-oxygen';
import {Form, useActionData} from '@remix-run/react';
import {useRef, useState} from 'react';
import {getInputStyleClasses} from '~/lib/utils';
import type {CustomerResetPayload} from '@shopify/hydrogen/storefront-api-types';
import {Heading, Button} from '~/components';
import {TextField} from '~/components/Input';
import {TextLink} from '~/components/Link';

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({
  request,
  context,
  params: {lang, id, resetToken},
}) => {
  if (
    !id ||
    !resetToken ||
    typeof id !== 'string' ||
    typeof resetToken !== 'string'
  ) {
    return badRequest({
      formError: 'Wrong token. Please try to reset your password again.',
    });
  }

  const formData = await request.formData();

  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');

  if (
    !password ||
    !passwordConfirm ||
    typeof password !== 'string' ||
    typeof passwordConfirm !== 'string' ||
    password !== passwordConfirm
  ) {
    return badRequest({
      formError: 'Please provide matching passwords',
    });
  }

  const {session, storefront} = context;

  try {
    const data = await storefront.mutate<{customerReset: CustomerResetPayload}>(
      CUSTOMER_RESET_MUTATION,
      {
        variables: {
          id: `gid://shopify/Customer/${id}`,
          input: {
            password,
            resetToken,
          },
        },
      },
    );

    const {accessToken} = data?.customerReset?.customerAccessToken ?? {};

    if (!accessToken) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerReset?.customerUserErrors.join(', '));
    }

    session.set('customerAccessToken', accessToken);

    return redirect(lang ? `${lang}/account` : '/account', {
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
      formError: 'Sorry. We could not update your password.',
    });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: 'Reset Password',
  };
};

export default function Reset() {
  const actionData = useActionData<ActionData>();
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );
  const [nativePasswordConfirmError, setNativePasswordConfirmError] = useState<
    null | string
  >(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirmInput, setPasswordConfirmInput] = useState('');

  const validatePasswordConfirm = () => {
    if (!passwordConfirmInput) return;

    if (passwordConfirmInput && passwordConfirmInput !== passwordInput) {
      setNativePasswordConfirmError('The two passwords entered did not match.');
    } else if (passwordConfirmInput) {
      setNativePasswordConfirmError(null);
    } else {
      setNativePasswordConfirmError('Please re-enter the password');
    }
  };

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-xl w-full">
        <Heading className="text-4xl mb-6">Change Password</Heading>
        <p className="mb-8 text-base lg:text-[18px] leading-6 lg:leading-7">
          Enter a new password for your account.
        </p>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form method="post" noValidate className="space-y-4">
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">{actionData.formError}</p>
            </div>
          )}
          <TextField
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.currentTarget.value)}
            className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-label="New Password"
            label="New Password"
            minLength={8}
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onBlur={(event) => {
              if (
                event.currentTarget.validity.valid ||
                !event.currentTarget.value.length
              ) {
                setNativePasswordError(null);
                validatePasswordConfirm();
              } else {
                setNativePasswordError(
                  event.currentTarget.validity.valueMissing
                    ? 'Please enter a password'
                    : 'Passwords must be at least 8 characters',
                );
              }
            }}
          />
          <TextField
            value={passwordConfirmInput}
            onChange={(event) =>
              setPasswordConfirmInput(event.currentTarget.value)
            }
            className={`mb-1 ${getInputStyleClasses(
              nativePasswordConfirmError,
            )}`}
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="current-password"
            aria-label="Re-enter password"
            label="Re-enter Password"
            minLength={8}
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onBlur={validatePasswordConfirm}
          />
          <div className="flex items-center justify-between">
            <Button className="w-full mt-5" type="submit">
              Reset Password
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
      </div>
    </div>
  );
}

const CUSTOMER_RESET_MUTATION = `#graphql
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
