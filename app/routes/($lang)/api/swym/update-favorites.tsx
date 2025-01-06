import {ActionArgs, json} from '@shopify/remix-oxygen';

const FAVORITES_LIST_NAME = 'favorites';

export type UpdateFavoritesArgs = {
  // Swym-generated user ID
  regid: string;
  // Swym-generated session ID
  sessionid: string;

  // array of products to add to favorites list
  add: string[];

  // array of products to remove from favorites list
  remove: string[];
};

export async function action({context, params, request}: ActionArgs) {
  // const {SWYM_API_KEY, SWYM_PID, SWYM_API_ENDPOINT} = context.env;

  const swymRegId = context.session.get('swymRegId');
  const swymSessionId = context.session.get('swymSessionId');

  if (!swymRegId || !swymSessionId) {
    return json({
      success: false,
      error: 'No session found',
    });
  }

  const data = await request.json();

  console.log({data, swymRegId, swymSessionId});

  // check if user has a favorites list

  // if not, create one

  // add / remove products to favorites list

  return json({
    success: true,
  });
}
