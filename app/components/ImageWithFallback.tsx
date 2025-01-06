import {useRouteLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {FallbackURL} from '~/lib/static-content';

export default function ImageWithFallback({data, ...props}) {
  return (
    <Image
      {...props}
      // this needs to be a full URL not relative
      data={data ? data : {url: FallbackURL}}
    />
  );
}
