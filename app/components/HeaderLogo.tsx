import {Link} from '@remix-run/react';

import {IconLogoWithText} from './Icon';

export function HeaderLogo() {
  return (
    <Link
      className="w-[162px] md:w-[185px] flex items-center font-bold"
      to="/"
      prefetch="intent"
    >
      <IconLogoWithText />
    </Link>
  );
}
