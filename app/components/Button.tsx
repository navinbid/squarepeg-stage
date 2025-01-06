import {forwardRef} from 'react';
import {Link} from '@remix-run/react';
import clsx from 'clsx';

import {missingClass} from '~/lib/utils';

export type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  as?: React.ElementType;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'large' | 'unavailable';
  width?: 'auto' | 'full';
  to?: string;
  // @TODO: Make button types polymorphic with Link types.
  prefetch?: 'intent' | 'hover';
  state?: any;
};

const baseButtonClasses =
  'inline-block rounded-full text-center py-3 px-8 font-extrabold transition-colors';

const variants: Record<ButtonProps['variant'], string> = {
  primary: `${baseButtonClasses} bg-brand hover:bg-brand-hover text-white`,
  large: `${baseButtonClasses} bg-brand hover:bg-brand-hover text-white px-8 py-3 font-extrabold text-base`,
  secondary: `${baseButtonClasses} border border-2 border-brand bg-white text-brand hover:text-white hover:bg-brand`,
  tertiary:
    'font-extrabold text-brand inline-block border-b-2 border-brand leading-none pb-1 border-link-underline',
  unavailable: `${baseButtonClasses} bg-neutral-88 hover:bg-neutral-92 text-neutral-8`,
} as const;

export const Button = forwardRef(
  (
    {
      as = 'button',
      className = '',
      variant = 'primary',
      width = 'auto',
      ...props
    }: ButtonProps,
    ref,
  ) => {
    const Component = props?.to ? Link : as;

    const widths = {
      auto: 'w-auto',
      full: 'w-full',
    };

    const styles = clsx(
      missingClass(className, 'bg-') && variants[variant],
      missingClass(className, 'w-') && widths[width],
      className,
    );

    return (
      <Component
        // @todo: not supported until react-router makes it into Remix.
        // preventScrollReset={true}
        className={styles}
        {...props}
        ref={ref}
      />
    );
  },
);
