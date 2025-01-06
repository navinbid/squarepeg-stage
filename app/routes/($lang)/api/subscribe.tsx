import { ActionFunction, json } from '@shopify/remix-oxygen';
import { KLAVIYO_API_BASE } from '~/lib/const';

export interface ActionData {
  success?: boolean;
  formError?: string;
  fieldErrors?: {
    email?: string;
  };
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData();
  const subscribedEmail = formData.has('email');
  switch (request.method) {
    case 'POST': {
      if (subscribedEmail) {
        const headers = {
          Authorization: `Klaviyo-API-Key ${context.env.KLAVIYO_API_KEY}`,
          revision: context.env.KLAVIYO_API_REVISION,
          'Content-Type': 'application/json',
        };
        try {
          const response = await fetch(
            `${KLAVIYO_API_BASE}/api/profile-subscription-bulk-create-jobs/`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                data: {
                  type: 'profile-subscription-bulk-create-job',
                  attributes: {
                    profiles: {
                      data: [
                        {
                          type: 'profile',
                          attributes: {
                            email: formData.get('email'),
                          },
                        },
                      ],
                    },
                  },
                  relationships: {
                    list: {
                      data: {
                        type: 'list',
                        id: context.env.KLAVIYO_LIST_ID,
                      },
                    },
                  },
                },
              }),
            },
          );
          // TODO: Probably should have some better handling here.
          if (response.status === 202) {
            return json({ status: 202 });
          } else {
            return json({ status: 400 });
          }
        } catch {
          return json({ status: 500 });
        }
      } else {
        return badRequest({
          fieldErrors: {
            email: 'Please provide an email address.',
          },
        });
      }
    }
  }
};
