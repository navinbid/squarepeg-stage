import {useFetcher} from '@remix-run/react';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {IconFavorite} from './Icon';
import {useIsProductFavorited} from '~/hooks/useFavoritesList';
import clsx from 'clsx';
import {useCustomer} from '~/hooks/useCustomer';
import {Link} from './Link';
import {useState} from 'react';

export type FavoriteButtonProps = React.ComponentProps<'button'> & {
  product: Product;
  children?: React.ReactNode;
  // optionally force the variant ID for favoriting to avoid mismatches between Swym and Shopify
  variantId?: number;
};

export function FavoriteButton({
  product,
  children,
  className,
  variantId = null,
  ...props
}: FavoriteButtonProps) {
  const favorite = useFetcher();
  const isProductFavorited = useIsProductFavorited(product.id);
  const [localIsFavorited, setLocalIsFavorited] = useState(isProductFavorited);
  const customer = useCustomer();

  const buttonClassName = clsx(
    'text-left text-primary/50 ml-6 text-sm disabled:cursor-not-allowed block',
    className,
  );

  if (!customer) {
    return (
      <Link to="/account/login" className={buttonClassName}>
        <IconFavorite
          isActive={isProductFavorited}
          className={clsx('h-6 w-6')}
        />
      </Link>
    );
  }

  return (
    <favorite.Form
      action="/account/saved-products"
      method={isProductFavorited ? 'DELETE' : 'POST'}
    >
      <input
        type="hidden"
        name="productId"
        value={product.id.split('/').at(-1)}
      />
      <input
        type="hidden"
        name="variantId"
        value={variantId || product.variants.nodes[0].id.split('/').at(-1)}
      />
      <input type="hidden" name="handle" value={product.handle} />
      <button
        className={buttonClassName}
        disabled={favorite.state !== 'idle'}
        onClick={() => {
          setLocalIsFavorited(!localIsFavorited);
        }}
        {...props}
      >
        {children || (
          <IconFavorite
            isActive={localIsFavorited}
            className={clsx('h-6 w-6')}
          />
        )}
      </button>
    </favorite.Form>
  );
}
