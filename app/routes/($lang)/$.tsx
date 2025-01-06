import {useLoaderData} from '@remix-run/react';
import {LoaderArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {getPageBySlug} from '~/lib/sanity';

export async function loader({params}: LoaderArgs) {
  console.log('LOADING SLUG PAGE');
  const {slug} = params;

  invariant(slug, 'Slug is required');

  const page = await getPageBySlug(slug);

  console.log({slug, page});

  if (!page) {
    throw new Response(null, {status: 404});
  }

  return {page};
}

export default function CustomPage() {
  const data = useLoaderData<typeof loader>();

  console.log(data);

  return <div>Custom Page</div>;
}
