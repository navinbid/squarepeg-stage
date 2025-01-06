import {LoaderArgs, json} from '@shopify/remix-oxygen';
import {v4 as uuidv4} from 'uuid';

export async function getSwymCredentials(
  {
    swymApiKey,
    swymPid,
    swymApiEndpoint,
  }: {
    swymApiKey: string;
    swymPid: string;
    swymApiEndpoint: string;
  },
  email: string,
) {
  const body = new URLSearchParams({
    useragenttype: 'mobileApp',
  });

  if (email) {
    body.append('useremail', email);
  } else {
    body.append('uuid', uuidv4());
  }

  const response = await fetch(
    `${swymApiEndpoint}/storeadmin/v3/user/generate-regid`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${swymPid}:${swymApiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  const data: {regid?: string; sessionid?: string; msg?: string} =
    await response.json();

  if (response.status !== 200) {
    throw new Error(data?.msg || 'Something went wrong');
  }

  return data;
}

export async function loader({context, params, request}: LoaderArgs) {
  const {SWYM_API_KEY, SWYM_PID, SWYM_API_ENDPOINT} = context.env;

  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  console.log({email});

  const id = email ? email : uuidv4();

  const body = new URLSearchParams({
    useragenttype: 'web',
  });

  if (email) {
    body.append('useremail', email);
  } else {
    body.append('uuid', id);
    // body.append('uuid', '1234');
  }

  const response = await fetch(
    `${SWYM_API_ENDPOINT}/storeadmin/v3/user/generate-regid`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${SWYM_PID}:${SWYM_API_KEY}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  console.log({response});

  const data: {regid?: string; sessionid?: string; msg?: string} =
    await response.json();

  console.log({data});

  if (response.status !== 200) {
    return json({
      success: false,
      error: data?.msg || 'Something went wrong',
    });
  }

  context.session.set('swymRegId', data.regid);
  context.session.set('swymSessionId', data.sessionid);

  return json(data, {
    headers: {
      'Set-Cookie': await context.session.commit(),
    },
  });
}
