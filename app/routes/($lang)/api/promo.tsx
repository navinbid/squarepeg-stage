import {ActionFunction, json} from '@shopify/remix-oxygen';

export interface ActionData {
  success?: boolean;
  formError?: string;
}

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();
  switch (request.method) {
    case 'POST': {
      const dismiss = formData.get('dismiss');
      if (dismiss) {
        await context.session.set('promoBannerDismissed', true);

        return json(
          {success: true},
          {
            status: 200,
            headers: {
              'Set-Cookie': await context.session.commit(),
            },
          },
        );
      }
    }
  }
};
