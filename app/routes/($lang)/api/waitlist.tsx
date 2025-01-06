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
  const hasVariant = formData.has('variant');
  const hasChannel = formData.has('channel');
  const hasEmail = formData.has('email');
  const hasPhone = formData.has('phone');

  switch (request.method) {
    case 'POST': {
      if (hasVariant && hasChannel && (hasEmail || hasPhone)) {
        const headers = {
          Authorization: `Klaviyo-API-Key ${context.env.KLAVIYO_API_KEY}`,
          revision: context.env.KLAVIYO_API_REVISION,
          'Content-Type': 'application/json',
        };
        try {
          let channels, profileAttributes;
          const channelType = String(formData.get('channel'));
          const variantNumber = String(formData.get('variant'))
            .split('/')
            .at(-1);
          const id = `$shopify:::$default:::${variantNumber}`;
          if (channelType === 'email') {
            channels = ['EMAIL'];
            profileAttributes = {
              email: String(formData.get('email')),
            };
          } else if (channelType === 'sms') {
            channels = ['SMS'];
            profileAttributes = {
              phone_number: String(formData.get('phone')),
            };
          }
          const response = await fetch(
            `${KLAVIYO_API_BASE}/api/back-in-stock-subscriptions/`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                data: {
                  type: 'back-in-stock-subscription',
                  attributes: {
                    profile: {
                      data: {
                        type: 'profile',
                        attributes: profileAttributes,
                      },
                    },
                    channels,
                  },
                  relationships: {
                    variant: {
                      data: {
                        type: 'catalog-variant',
                        id,
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
            email: 'Please provide an email address or phone number.',
          },
        });
      }
    }
  }
};
