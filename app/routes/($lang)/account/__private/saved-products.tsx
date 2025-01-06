import { Await, useLoaderData } from '@remix-run/react';
import {
  ActionArgs,
  LoaderArgs,
  defer,
  json,
  redirect,
} from '@shopify/remix-oxygen';
import { updateFavoritesListItems, getOrCreateFavoritesList } from '~/lib/swym';
import { PRODUCTS_QUERY } from '../../api/products';
import { ProductConnection } from '@shopify/hydrogen/storefront-api-types';
import {
  FavoriteItem,
  ProductWithDiscountAndVariantId,
} from '~/components/FavoriteItem';
import { CustomBreadcrumbs } from '~/components/Breadcrumbs';
import { HeaderText } from '~/components/HeaderText';
import { BodyText } from '~/components/BodyText';
import { Button, IconFavorite, Link, ProductSwimlane } from '~/components';
import { appendDiscountsToProducts } from '~/lib/shopify-admin.server';
import { HOMEPAGE_FEATURED_PRODUCTS_QUERY } from '../../pro';
import { Suspense } from 'react';
import { getVariantsByUserProStatus } from '~/lib/product-variant';


export const handle = {
  seo: {
    title: 'Saved Products | Square Peg',
  },
};

export async function loader({ context, params }: LoaderArgs) {
  // check if user is logged in
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (!customerAccessToken) {
    return redirect('/account/login');
  }

  const regId = context.session.get('swymRegId');
  const sessionId = context.session.get('swymSessionId');

  const swymParams = {
    swymApiEndpoint: context.env.SWYM_API_ENDPOINT,
    swymPID: context.env.SWYM_PID,
    regId,
    sessionId,
  };

  const list = await getOrCreateFavoritesList(swymParams);

  const featuredProducts = await context.storefront.query<{
    products: ProductConnection;
  }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY);

  const featuredProductsWithDiscounts = await appendDiscountsToProducts(
    featuredProducts.products.nodes,
  );

  const filteredProductsWithDiscounts = featuredProductsWithDiscounts.map(
    (product) => {
      // filter out pro or standard variants based on user pro status
      const filteredVariants = getVariantsByUserProStatus(product, context);

      // update product with filteredVariants
      product.variants.nodes = filteredVariants;
      return product;
    },
  );

  if (list.listcontents.length === 0) {
    return json({
      products: [],
      featuredProducts: filteredProductsWithDiscounts,
    });
  }

  const query = list.listcontents
    .map((product) => `id:${product.empi}`)
    .join(' OR ');

  const response = await context.storefront.query<{
    products: ProductConnection;
  }>(PRODUCTS_QUERY, {
    variables: {
      query,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
      count: 50,
    },
  });

  const productsWithDiscounts = await appendDiscountsToProducts(
    response.products.nodes,
  );

  const productsWithVariantId = productsWithDiscounts.map((product) => {
    const variantId = list?.listcontents?.find(
      (listItem) => listItem.empi === Number(product.id.split('/').at(-1)),
    )?.epi;

    return {
      ...product,
      variantId,
    };
  });

  return defer({
    products: productsWithVariantId,
    featuredProducts: filteredProductsWithDiscounts,
  });
}

// add or remove product form wishlist
export async function action({ context, request }: ActionArgs) {
  const regId = context.session.get('swymRegId');
  const sessionId = context.session.get('swymSessionId');
  const listId = context.session.get('swymListId');
  const PUBLIC_STORE_DOMAIN = 'squarepegsupply.myshopify.com';

  const formData = await request.formData();

  // get action type (add or remove product)
  const actionType = request.method.toUpperCase() as 'POST' | 'DELETE';

  const productId = formData.get('productId') as string;
  const variantId = formData.get('variantId') as string;
  const handle = formData.get('handle') as string;

  const productURL = `https://${PUBLIC_STORE_DOMAIN}/products/${handle}`;

  const response = await updateFavoritesListItems({
    swymApiEndpoint: context.env.SWYM_API_ENDPOINT,
    swymPID: context.env.SWYM_PID,
    regId,
    listId,
    sessionId,
    productId,
    variantId,
    productURL,
    action: actionType,
  });

  return json({
    data: response,
  });
}

export default function FavoritesPage() {
  // @ts-ignore
  const { products, featuredProducts } = useLoaderData<typeof loader>();

  return (
    <div className="bg-white">
      <div className="content-wrapper py-6 md:py-8 lg:py-12">
        <CustomBreadcrumbs
          segments={[
            { href: '/account', text: 'Account' },
            { href: '/account/saved-products', text: 'Saved Products' },
          ]}
        />
        <div className="flex flex-col md:flex-row mt-12 gap-16">
          <div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-20 h-20 bg-neutral-92 rounded-full flex-shrink-0">
                <IconFavorite isActive />
              </div>
              <div className="mb-2">
                <HeaderText level="2" className="whitespace-nowrap !mb-0">
                  Saved Products
                </HeaderText>
                <BodyText level="body">{products?.length} items</BodyText>
              </div>
            </div>
            <Link to="/" className="ml-auto">
              <Button width="full">Continue Shopping</Button>
            </Link>
          </div>
          <div className="divide-y-2 md:border-t">
            {products?.map((product) => (
              <FavoriteItem
                key={product.id}
                product={product as ProductWithDiscountAndVariantId}
              />
            ))}
          </div>
        </div>
      </div>
      {featuredProducts && (
        <div className="my-20">
          <Suspense>
            <Await resolve={featuredProducts}>
              {(products) => {
                if (!products) return <></>;
                return (
                  <ProductSwimlane
                    products={products}
                    title="Popular Supplies"
                    count={4}
                  />
                );
              }}
            </Await>
          </Suspense>
        </div>
      )}
    </div>
  );
}
