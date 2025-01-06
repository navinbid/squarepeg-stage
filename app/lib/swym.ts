// @ts-nocheck

import {FavoritesList} from './swym-types';

const DEFAULT_LIST_NAME = 'Favorites';

export async function getSwym(formData: FormData) {
  const productId = formData.productId;
  const productUrl = formData.productUrl;
  const productVariantId = formData.productVariantId;
  const userEmail = formData.email;

  const endpoint = `https://swymstore-v3premium-01.swymrelay.com/storeadmin/bispa/subscriptions/create`;

  const API_KEY = btoa(
    '8ycmgpko3fxOw6EbxiiIJBXLBHmYPoyEobXb3Qd-A2Gwwpo6-j9EvNaa2h1F8i4CdK2ZfrLOxeWrwWFyr7cFhg',
  );
  const PID = btoa('0bVeQH20kRCBOpiEWhCage91JkGz2sk+yFr2xLY3LCQ=');

  const requestOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${API_KEY} : ${PID}`,
    },
    body: new URLSearchParams({
      products: [
        {
          // 'PRODUCT VARIANT ID'
          epi: productVariantId,
          // 'PRODUCT ID/PRODUCT MASTER ID'
          empi: productId,
          // 'CANNONICAL URL OF THE PRODUCT'
          du: `https://squarepegsupply.myshopify.com/products/${productUrl}`,
        },
      ],
      medium: 'email',
      mediumvalue: `${userEmail}`,
      topics: ['backinstock', 'comingsoon'],
      addtomailinglist: '1',
      prototype: null,
      toString: () => {
        throw new Error('Not yet implemented!');
      },
    }).toString(),
  };

  const response = await fetch(endpoint, requestOptions);
  const data = await response.json();

  return data;
}

export async function getSwymAuth(swimApiEndpoint, swimAPIKey, swimPID) {
  const response = await fetch(`${swimApiEndpoint}/storeadmin/me`, {
    headers: {
      // encode swimPID to base64
      Authorization: `Basic ${btoa(`${swimPID}:${swimAPIKey}`)}`,
    },
  });

  const data = await response.json();

  return data;
}

export async function getOrCreateFavoritesList({
  swymApiEndpoint,
  swymPID,
  regId,
  sessionId,
}: {
  swymApiEndpoint: string;
  swymPID: string;
  regId: string;
  sessionId: string;
}): FavoritesList | null {
  try {
    const body = new URLSearchParams({
      regid: regId,
      sessionid: sessionId,
    });

    const response = await fetch(
      `${swymApiEndpoint}/api/v3/lists/fetch-lists?pid=${encodeURIComponent(
        swymPID,
      )}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body,
      },
    );

    const data = await response.json();

    const existingList = data.at(0);

    if (!existingList) {
      const list = await createFavoritesList({
        swymApiEndpoint,
        swymPID,
        regId,
        sessionId,
      });
      return list;
    }

    return existingList;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createFavoritesList({
  swymApiEndpoint,
  swymPID,
  regId,
  sessionId,
}: {
  swymApiEndpoint: string;
  swymPID: string;
  regId: string;
  sessionId: string;
}) {
  const body = new URLSearchParams({
    regid: regId,
    sessionid: sessionId,
    lname: DEFAULT_LIST_NAME,
  });

  const response = await fetch(
    `${swymApiEndpoint}/api/v3/lists/create?pid=${encodeURIComponent(swymPID)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'user-agent': 'Mozilla/4.0 Custom User Agent',
      },
      body,
    },
  );

  const data = await response.json();

  return data;
}

// add or remove item from favorites list
export async function updateFavoritesListItems({
  swymApiEndpoint,
  swymPID,
  listId,
  productId,
  variantId,
  productURL,
  regId,
  sessionId,
  action,
}: {
  swymApiEndpoint: string;
  swymPID: string;
  listId: string;
  productId: string;
  variantId: string;
  productURL: string;
  regId: string;
  sessionId: string;
  action: 'POST' | 'DELETE';
}) {
  const baseParams = {
    regid: regId,
    sessionid: sessionId,
    lid: listId,
  };

  const productData = JSON.stringify([
    {
      epi: variantId,
      empi: productId,
      du: productURL,
    },
  ]);

  const body = new URLSearchParams({
    ...baseParams,
    [action === 'POST' ? 'a' : 'd']: productData,
  });

  const response = await fetch(
    `${swymApiEndpoint}/api/v3/lists/update-ctx?pid=${encodeURIComponent(
      swymPID,
    )}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'user-agent': 'Mozilla/4.0 Custom User Agent',
      },
      body,
    },
  );

  const data = await response.json();

  return data;
}
