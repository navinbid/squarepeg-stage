import {useMemo} from 'react';
import {Link} from '@remix-run/react';

import {IconBag} from './Icon';
import {useIsHydrated} from '~/hooks/useIsHydrated';

export function CartBadge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag className="h-[28px] w-[28px]" />
        {count > 0 && (
          <div
            className={`${
              dark
                ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
                : 'text-contrast bg-primary'
            } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
          >
            {<span>{count}</span>}
          </div>
        )}
      </>
    ),
    [count, dark],
  );

  return (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );

  // TODO: Revisit when drawer designs are available
  // return isHydrated ? (
  //   <button
  //     onClick={openCart}
  //     className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
  //   >
  //     {BadgeCounter}
  //   </button>
  // ) : (
  //   <Link
  //     to="/cart"
  //     className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
  //   >
  //     {BadgeCounter}
  //   </Link>
  // );
}
