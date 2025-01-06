import {Await, useMatches} from '@remix-run/react';
import {Suspense} from 'react';
import {CartBadge} from './CartBadge';

export function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const [root] = useMatches();

  return (
    <Suspense
      fallback={<CartBadge count={0} dark={isHome} openCart={openCart} />}
    >
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <CartBadge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}
