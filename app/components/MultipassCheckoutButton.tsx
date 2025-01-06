import React, {useCallback, forwardRef} from 'react';
import {multipass} from '~/lib/multipass/multipass';
import {Button} from './Button';

type MultipassCheckoutButtonProps = {
  // as?: keyof React.ElementType;
  checkoutUrl: string;
  children: React.ReactNode;
  onClick?: () => void;
  redirect?: boolean;
};

type MultipassCheckoutButtonRef = HTMLButtonElement;

/*
  This component attempts to persist the customer session
  state in the checkout by using multipass.
  Note: multipass checkout is a Shopify Plus+ feature only.
*/
export const MultipassCheckoutButton = forwardRef<
  MultipassCheckoutButtonRef,
  MultipassCheckoutButtonProps
>((props, ref) => {
  const {
    children,
    onClick,
    checkoutUrl,
    redirect = true,
    // as = 'button',
  } = props;

  const updatedCheckoutUrl =
    checkoutUrl?.replace(
      'squarepegsupply.myshopify.com',
      'checkout.squarepegsupply.com',
    ) || checkoutUrl;

  // const Element: keyof React.ElementType = as;

  const checkoutHandler = useCallback(
    async (event) => {
      event.preventDefault();
      if (!updatedCheckoutUrl) return;

      if (typeof onClick === 'function') {
        onClick();
      }

      // If they user is logged in we persist it in the checkout,
      // otherwise we log them out of the checkout too.
      return await multipass({
        return_to: updatedCheckoutUrl,
        redirect,
      });
    },
    [redirect, updatedCheckoutUrl, onClick],
  );

  return (
    <Button width="full" ref={ref} onClick={checkoutHandler}>
      {children}
    </Button>
  );
});
