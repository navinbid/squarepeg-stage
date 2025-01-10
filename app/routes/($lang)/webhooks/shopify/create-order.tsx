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

  console.log('ORDER DATA:', data);


  const erpsuccessresponse = await fetch(
    `https://ecom-newbrand-dev.myshopify.com/admin/api/2022-07/orders/${data.id}/metafields.json`,
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
    (field) => field.key === 'ERPStatus'
  );

  // Check if the value of the metafield is "true"
  if (erpSuccessMetafield && erpSuccessMetafield.value === 'request-send') {
    console.log("ERP request has already send successfully.");
    return json({ message: 'Order has already been processing' });
  }

  // Setting "request-send" before ERP call
  await updateOrderMetafields({ success: 'false', status: 'request-send', orderId: data.admin_graphql_api_id });

  // Continue with your action if the condition is not met
  const customerId = data.customer.id;
  // console.log(`Customer ID: ${customerId}`);

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
    inforConnectionString: 'appserverDC://10.100.5.10:7190/sxapiappsrv',
  });

  const builder = new Builder();
  const xml = builder.buildObject(erpOrder);

  // console.log('XML:', xml);


  const erpResponse = await fetch(ERP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://tempuri.org/IServiceOE/OEFullOrderMntV6',
    },
    body: xml,
  });

  const text = await erpResponse.text();
  console.log("Responce:", erpResponse.status);

  if (erpResponse.status === 200) {
    await updateOrderMetafields({
      success: 'true',
      status: 'request-send',
      orderId: data.admin_graphql_api_id,
    });
  }

  try {
    if (text) {

      const parsed = await parseStringPromise(text, {
        explicitArray: false,
        explicitRoot: false,
      });

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
          status: 'request-send',
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
        'appserverDC://10.100.5.10:7190/sxapiappsrv',
      );

      // console.log("OENumber:", OENumber)
      // console.log("WTNumber:", wtNumber)

      // update order metafield "erpSuccess" to true
      await updateOrderMetafields({
        success: 'true',
        status: 'request-send',
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
      status: 'request-send',
      orderId: data.admin_graphql_api_id,
    });
    return json({ message: 'Error creating order' });
  }


  return json({ message: 'Order created successfully' });
}