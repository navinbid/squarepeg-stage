import { ActionArgs, json } from '@shopify/remix-oxygen';
import { CreateOrder } from '../../../../lib/create-order-types';
import { parseStringPromise, Builder } from 'xml2js';
import {
  ERP_ENDPOINT,
  GET_CUSTOMER_METAFIELDS,
  buildErpRequest,
  getOrderWtNumber,
  updateOrderMetafields,
} from '~/lib/create-order-webhook';
import { adminGraphQLClient } from '~/lib/shopify-admin.server';

export type CustomerWithMetafields = {
  customer?: {
    id: string;
    metafields: {
      nodes: {
        id: string;
        key: string;
        namespace: string;
        value: string;
      }[];
    };
  };
};

export async function action({ request, context }: ActionArgs) {

  console.log('ORDER CREATE WEBHOOK START');
  const data: CreateOrder = await request.json();

  console.log('ORDER DATA:');
  console.log(data);


  const erpsuccessresponse = await fetch(
    `https://ecom-newbrand.myshopify.com/admin/api/2022-07/orders/${data.id}/metafields.json`,
    {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': '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', // Securely fetch token from env
        'Content-Type': 'application/json',
      },
    }
  );

  const { metafields } = await erpsuccessresponse.json();

  const erpSuccessMetafield = metafields.find(
    (field) => field.key === 'erpSuccess'
  );

  // Check if the value of the metafield is "true"
  if (erpSuccessMetafield && erpSuccessMetafield.value === 'true') {
    console.log("ERP success has been processed");
    return;
  }

  // Continue with your action if the condition is not met



  const customerId = data.customer.id;
  console.log(`Customer ID: ${customerId}`);

  // fetch customer from Shopify API to get metafields
  const response = await adminGraphQLClient.request<CustomerWithMetafields>(
    GET_CUSTOMER_METAFIELDS,
    {
      customerId: `gid://shopify/Customer/${customerId}`,
    },
  );

  const isProAccount =
    Boolean(response?.customer) &&
    response?.customer?.metafields?.nodes?.some(
      (node: any) => node.key === 'proAccount' && Number(node.value) === 1,
    );

  const erpOrder = await buildErpRequest({
    isProAccount,
    order: data,
    inforConnectionString: context.env.INFOR_CONNECTION_STRING,
  });

  console.log(context.env.INFOR_CONNECTION_STRING);
  const builder = new Builder();
  const xml = builder.buildObject(erpOrder);

  console.log('XML');
  console.log(xml);

  const erpResponse = await fetch(ERP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://tempuri.org/IServiceOE/OEFullOrderMntV6',
    },
    body: xml,
  });

  const text = await erpResponse.text();
  console.log("Responce");
  console.log(text);
  try {
    if (text) {
      const parsed = await parseStringPromise(text, {
        explicitArray: false,
        explicitRoot: false,
      });
      console.log(parsed)


      const responseError =
        parsed['s:Body']['OEFullOrderMntV6Response']['OEFullOrderMntV6Result'][
        'a:ErrorMessage'
        ];

      if (responseError !== '') {
        console.log('Error in response to creating ERP order');
        console.error(responseError);
        // update order metafield "erpSuccess" to false
        await updateOrderMetafields({
          success: 'false',
          orderId: data.admin_graphql_api_id,
        });

        return json({ message: 'Error creating order' });
      }

      const OENumber =
        parsed['s:Body']['OEFullOrderMntV6Response']['OEFullOrderMntV6Result'][
        'a:Outacknowledgement'
        ]['a:Outacknowledgement']['a:Data1'];

      const wtNumber = await getOrderWtNumber(
        OENumber.split('-')[0],
        context.env.INFOR_CONNECTION_STRING,
      );
      console.log(OENumber)
      console.log(wtNumber)

      // update order metafield "erpSuccess" to true
      await updateOrderMetafields({
        success: 'true',
        orderId: data.admin_graphql_api_id,
        wtNumber,
        OENumber,
      });

    }
  } catch (error) {
    console.log('UNEXPECTED ERROR:');
    console.error(error);
    // if any unexpected exception occurs, assume the ERP did not receive the order
    await updateOrderMetafields({
      success: 'false',
      orderId: data.admin_graphql_api_id,
    });
    return json({ message: 'Error creating order' });
  }

  return json({ message: 'Order created successfully' });
}
