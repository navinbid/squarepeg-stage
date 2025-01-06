import { useLoaderData, useParams } from '@remix-run/react';
import { LoaderArgs, defer } from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {
  Breadcrumbs,
  CustomBreadcrumbs,
  toTitleCase,
} from '~/components/Breadcrumbs';
import {
  getProductsBySubcollection,
  getSubcollectionByHandle,
  urlFor,
} from '~/lib/sanity';
import SearchPage, {
  SEARCH_QUERY,
  buildFilterListFromProducts,
  buildSanityQueryFromSearchParams,
} from '../../search';
import { PAGINATION_SIZE } from '~/lib/const';
import { ProductConnection } from '@shopify/hydrogen/storefront-api-types';
import { HeaderText } from '~/components/HeaderText';
import { appendDiscountsToProducts } from '~/lib/shopify-admin.server';
import { getVariantsByUserProStatus } from '~/lib/product-variant';
import { SeoHandleFunction, getPaginationVariables } from '@shopify/hydrogen';
import { functionRuntimeWrapper, kebabCaseToTitleCase } from '~/lib/utils';
import RecentlyViewedProducts from '~/components/RecentlyViewedProducts';

export const seo: SeoHandleFunction<typeof loader> = ({ params, data }) => {
  const description =
    data?.subcollection?.description ||
    `Check out SquarePeg's collection of ${kebabCaseToTitleCase(
      params.subcollectionHandle,
    )} products.`;

  return {
    title: `${kebabCaseToTitleCase(params.subcollectionHandle)} | Square Peg`,
    description: `Check out SquarePeg's collection of ${kebabCaseToTitleCase(
      params.subcollectionHandle,
    )} products.`,
  };
};

export const handle = {
  seo,
};

export async function loader({ params, request, context }: LoaderArgs) {
  const startTime = Date.now();
  const { subcollectionHandle } = params;

  invariant(subcollectionHandle, 'No subcollection handle provided');

  const searchParams = new URL(request.url).searchParams;
  const { sort } = Object.fromEntries(searchParams.entries());

  const cursor = searchParams.get('cursor')!;
  const searchTerm = searchParams.get('q')!;

  const queryContent = buildSanityQueryFromSearchParams(searchParams);

  const subcollection = await getSubcollectionByHandle(subcollectionHandle);

  async function getAllProducts() {
    // await wait(3000);
    const sanityResults = await functionRuntimeWrapper(
      getProductsBySubcollection(subcollectionHandle, queryContent),
      'getProductsBySubcollection',
    );

    const filterList = buildFilterListFromProducts(sanityResults);

    const sortKey = sort?.includes('REVERSE') ? sort.split('_')[0] : sort;

    const paginationVariables = getPaginationVariables(request, {
      pageBy: PAGINATION_SIZE,
    });

    const variables = {
      ...paginationVariables,
      searchTerm,
      cursor,
      reverse: sort?.includes('REVERSE'),
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
      // @ts-ignore
      query: sanityResults.map((product) => `id:${product.id}`).join(' OR '),
      sortKey: sortKey || 'RELEVANCE',
    };

    const data = await functionRuntimeWrapper(
      context.storefront.query<{
        products: ProductConnection;
      }>(SEARCH_QUERY, {
        variables,
      }),
      'storefront.query',
    );

    invariant(data, 'No data returned from Shopify API');

    const { products } = data;
    const productsWithDiscounts = await functionRuntimeWrapper(
      appendDiscountsToProducts(products.nodes),
      'appendDiscountsToProducts',
    );
    products.nodes = productsWithDiscounts;

    const filteredProductsWithDiscounts = products.nodes.map((product) => {
      // filter out pro or standard variants based on user pro status
      const filteredVariants = getVariantsByUserProStatus(product, context);

      // update product with filteredVariants
      product.variants.nodes = filteredVariants;
      return product;
    });
    products.nodes = filteredProductsWithDiscounts;

    return {
      products,
      filterList,
      sanityResults,
    };
  }

  return defer({
    subcollection,
    searchTerm,
    searchResults: getAllProducts(),
  });
}

export default function SubcollectionPage() {
  const params = useParams();
  const { subcollection } = useLoaderData<ReturnType<typeof loader>>();
  const formattedSubcollectionTitle = toTitleCase(
    kebabCaseToTitleCase(subcollection.name),
  );

  return (
    <>
      <header className="bg-neutral-98 pt-6 pb-12">
        <div className="content-wrapper">
          <div>
            <CustomBreadcrumbs
              segments={[
                {
                  href: `/collections/${params?.collectionHandle}`,
                  text: toTitleCase(params?.collectionHandle),
                },
                {
                  href: `/collections/${params?.collectionHandle}/${params?.subcollectionHandle}`,
                  text: formattedSubcollectionTitle,
                },
              ]}
            />
            <HeaderText className="!mb-0 mt-[72px]" level="1">
              {formattedSubcollectionTitle}
            </HeaderText>
          </div>
        </div>
      </header>
      <SearchPage collectionName={formattedSubcollectionTitle} />
      <div className='!border-t'>
        <div className='content-wrapper lg:mt-16 py-6 md:py-8 lg:py-12'>
          <RecentlyViewedProducts
            count={3}
            heading="Recently Viewed Products"
          />
        </div>
      </div>
    </>
  );
}

