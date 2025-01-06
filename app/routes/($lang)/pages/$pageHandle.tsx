import {
  json,
  type MetaFunction,
  type SerializeFrom,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import type { Page as PageType } from '@shopify/hydrogen/storefront-api-types';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { PageHeader, Section } from '~/components';
import type { SeoHandleFunction } from '@shopify/hydrogen';

const seo: SeoHandleFunction<typeof loader> = ({ data }) => ({
  title: data?.page?.seo?.title,
  description: data?.page?.seo?.description,
});

export const handle = {
  seo,
};

export async function loader({ request, params, context }: LoaderArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  const { page } = await context.storefront.query<{ page: PageType }>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, { status: 404 });
  }

  return json(
    { page },
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <>

      <div className="bg-neutral-98 pb-4">
        <div className="content-wrapper pt-6">
          {/* <Breadcrumbs /> */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 py-6">
              <li>
                <div className="flex items-center">
                  <a
                    href="/"
                    className="text-sm font-bold text-gray-700 hover:text-gray-900"
                  >
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <a
                    href={"#"}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    {page.title === "Frequenty Asked Questions" ? "FAQs" : page.title}
                  </a>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <PageHeader
          heading={page.title}
          className="content-wrapper pt-18 text-[#2d4027]"
        />
      </div>
      <Section className="max-w-4xl mx-auto grid grid-cols-1 !my-8 faq-heading">
        <div
          dangerouslySetInnerHTML={{ __html: page.body }}
          className="prose dark:prose-invert"
        />
      </Section>

    </>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
