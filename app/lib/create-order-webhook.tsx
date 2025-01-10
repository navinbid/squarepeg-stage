import { parseStringPromise } from 'xml2js';
import { CreateOrder, OrderRequest } from './create-order-types';
import { adminGraphQLClient } from './shopify-admin.server';

export const ERP_ENDPOINT =
  'https://webui.southernpipe.com/Nxt_API/ServiceOE.svc';

// const CONNECTION_STRING = 'AppserverDC://webapp-test:7290/testsxapiappsrv';
const PROD_CONNECTION_STRING = 'AppserverDC://10.100.5.10:7190/sxapiappsrv';

export const erpOrderTemplate = (connectionString: string): OrderRequest => ({
  'soapenv:Envelope': {
    $: {
      'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
      'xmlns:tem': 'http://tempuri.org/',
      'xmlns:nxt':
        'http://schemas.datacontract.org/2004/07/NxT_API.com.infor.sxapi.connection',
      'xmlns:nxt1':
        'http://schemas.datacontract.org/2004/07/NxT_API.com.infor.sxapi.OEFullOrderMntV6',
    },
    'soapenv:Header': '',
    'soapenv:Body': {
      'tem:OEFullOrderMntV6': {
        'tem:callConnection': {
          'nxt:CompanyNumber': 1,
          'nxt:ConnectionString': connectionString,
          'nxt:DomainIdentifier': '',
          'nxt:OperatorInitials': 'api',
          'nxt:OperatorPassword': 'api',
          'nxt:StateFreeAppserver': false,
        },
        'tem:request': {
          'nxt1:Incustomer': {
            'nxt1:Incustomer': {
              'nxt1:CustomerNumber': 1970000,
            },
          },
          'nxt1:Initem': {
            'nxt1:Initem': null,
          },
          'nxt1:Inorder': {
            'nxt1:Inorder': null,
          },
          'nxt1:InshipTo': {
            'nxt1:InshipTo': null,
          },
        },
      },
    },
  },
});

export async function buildErpRequest({
  isProAccount,
  order,
  inforConnectionString,
}: {
  isProAccount: boolean;
  order: CreateOrder;
  inforConnectionString: string;
}) {
  const erpOrder = { ...erpOrderTemplate(inforConnectionString) };

  const orderWithLineItemDiscounts = await adminGraphQLClient.request(
    GET_ORDER_LINE_ITEM_DISCOUNT_PRICE,
    {
      orderId: `gid://shopify/Order/${order.id}`,
    },
  );

  // set shipping info
  erpOrder['soapenv:Envelope']['soapenv:Body']['tem:OEFullOrderMntV6'][
    'tem:request'
  ]['nxt1:InshipTo']['nxt1:InshipTo'] = {
    'nxt1:Address1': order.shipping_address.address1,
    'nxt1:Address2': order.shipping_address.address2,
    'nxt1:City': order.shipping_address.city,
    'nxt1:Name': order.shipping_address.name,
    // @ts-ignore
    'nxt1:Phone': Number(order.shipping_address.phone.replace(/\D/g, '')),
    // @ts-ignore
    'nxt1:PostalCode': order.shipping_address.zip,
    'nxt1:State': order.shipping_address.province_code,
  };

  // set customer number based on pro or standard customer
  erpOrder['soapenv:Envelope']['soapenv:Body']['tem:OEFullOrderMntV6'][
    'tem:request'
  ]['nxt1:Incustomer']['nxt1:Incustomer']['nxt1:CustomerNumber'] = isProAccount
      ? 197
      : 1970000;

  // order level info
  erpOrder['soapenv:Envelope']['soapenv:Body']['tem:OEFullOrderMntV6'][
    'tem:request'
  ]['nxt1:Inorder']['nxt1:Inorder'] = {
    'nxt1:ActionType': 'original',
    'nxt1:AddonAmount1': Number(
      order?.total_shipping_price_set?.shop_money?.amount || 0,
    ),
    'nxt1:AddonAmount2':
      0 -
      Number(
        // @ts-ignore
        orderWithLineItemDiscounts?.order?.currentTotalDiscountsSet?.shopMoney
          ?.amount || 0,
      ),
    'nxt1:AddonNumber1': 2,
    'nxt1:AddonNumber2': 21,
    'nxt1:AddonType1': '$',
    'nxt1:AddonType2': '$',
    'nxt1:PurchaseOrderNumber': order.name,
    'nxt1:ShipVia': 'FDXE',
    'nxt1:TakenBy': 'zcm',
    'nxt1:TaxableFlag': order.tax_exempt ? 'n' : 'y',
    'nxt1:TransactionType': 'do',
    'nxt1:Warehouse': 'ZCM',
  };

  const lineItems = order.line_items.map((item, index) => {
    const unitCostWithDiscount =
      // @ts-ignore
      orderWithLineItemDiscounts?.order?.lineItems?.nodes?.find(
        (node: any) => node.id === `gid://shopify/LineItem/${item.id}`,
      )?.discountedUnitPriceAfterAllDiscountsSet?.shopMoney?.amount;

    const discountAmount =
      (Number(item.price) * 100 - Number(unitCostWithDiscount) * 100) / 10 || 0;

    return {
      'nxt1:LineIdentifier': index + 1,
      'nxt1:OrderType': 't',
      'nxt1:PrintPickTickets': 1,
      'nxt1:QuantityOrdered': item.quantity,
      'nxt1:SellerProductCode': item.sku,
      // unit cost before discount
      'nxt1:UnitCost': Number(item.price),
      // shipping amount
      'nxt1:AddonAmount1': Number(
        order?.total_shipping_price_set?.shop_money?.amount || 0,
      ),
      'nxt1:AddonNumber1': 2,
      'nxt1:AddonType1': '$',
      // discount amount (must be negative)
      'nxt1:AddonAmount2': discountAmount * -1,
      'nxt1:AddonNumber2': 21,
      'nxt1:AddonType2': '$',
    };
  });

  // line item info
  erpOrder['soapenv:Envelope']['soapenv:Body']['tem:OEFullOrderMntV6'][
    'tem:request'
  ]['nxt1:Initem'] = {
    'nxt1:Initem': lineItems,
  };

  return erpOrder;
}

export async function updateOrderMetafields({
  success,
  status,
  orderId,
  wtNumber = null,
  OENumber = null,
}: {
  success: string;
  status: string;
  orderId: string;
  wtNumber?: string;
  OENumber?: string;
}) {
  const metafields = [
    // {
    //   ownerId: orderId,
    //   namespace: 'arena',
    //   key: 'erpSuccess',
    //   value: success,
    //   type: 'boolean',
    // },
  ];

  if (success) {
    metafields.push({
      ownerId: orderId,
      namespace: '3193253',
      key: 'erpSuccess',
      value: success,
      type: 'boolean',
    });
  }

  if (status) {
    metafields.push({
      ownerId: orderId,
      namespace: 'arena',
      key: 'ERPStatus',
      value: status,
      type: 'single_line_text_field',
    });
  }

  if (wtNumber) {
    metafields.push({
      ownerId: orderId,
      namespace: 'arena',
      key: 'wtNumber',
      value: wtNumber,
      type: 'single_line_text_field',
    });
  }

  if (OENumber) {
    metafields.push({
      ownerId: orderId,
      namespace: 'arena',
      key: 'OENumber',
      value: OENumber,
      type: 'single_line_text_field',
    });
  }

  const response: any = await adminGraphQLClient.request(
    UPDATE_ORDER_METAFIELDS,
    {
      metafields,
    },
  );

  if (response.metafieldsSet?.userErrors?.length) {
    console.error(response.metafieldsSet?.userErrors);
  }

  return response;
}

export async function getOrderWtNumber(
  orderId: string,
  inforConnectionString: string,
): Promise<string | null> {
  const orderRequest = buildOrderRequest(orderId, inforConnectionString);

  const response = await fetch(ERP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://tempuri.org/IServiceOE/OEGetSingleOrderV3',
    },
    body: orderRequest,
  });

  const text = await response.text();

  const jsonResponse = await parseStringPromise(text, {
    explicitArray: false,
    explicitRoot: false,
  });

  const outlineItem =
    jsonResponse['s:Body']['OEGetSingleOrderV3Response'][
    'OEGetSingleOrderV3Result'
    ]?.['a:Outlineitem']?.['a:Outlineitem'];

  // if outlineItem is an array, get the first item, otherwise
  const wtNumber = Array.isArray(outlineItem)
    ? outlineItem[0]?.['a:TiedOrderNumber']
    : outlineItem?.['a:TiedOrderNumber'];

  console.log({ wtNumber });

  if (!wtNumber) {
    throw new Error('No WT Number found');
  }

  return wtNumber;
}

const buildOrderRequest = (orderId: string, inforConnectionString: string) =>
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:nxt="http://schemas.datacontract.org/2004/07/NxT_API.com.infor.sxapi.connection" xmlns:nxt1="http://schemas.datacontract.org/2004/07/NxT_API.com.infor.sxapi.OEGetSingleOrderV3">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:OEGetSingleOrderV3>
        <tem:callConnection>
            <nxt:CompanyNumber>1</nxt:CompanyNumber>
            <nxt:ConnectionString>${inforConnectionString}</nxt:ConnectionString>
            <nxt:DomainIdentifier></nxt:DomainIdentifier>
            <nxt:OperatorInitials>api</nxt:OperatorInitials>
            <nxt:OperatorPassword>api</nxt:OperatorPassword>
            <nxt:StateFreeAppserver>false</nxt:StateFreeAppserver>
         </tem:callConnection>
         <tem:request>
            <nxt1:IncludeHeaderData>false</nxt1:IncludeHeaderData>
            <nxt1:IncludeLineData>true</nxt1:IncludeLineData>
            <nxt1:IncludeTaxData>false</nxt1:IncludeTaxData>
            <nxt1:IncludeTotalData>false</nxt1:IncludeTotalData>
            <nxt1:OrderNumber>${orderId}</nxt1:OrderNumber>
         </tem:request>
      </tem:OEGetSingleOrderV3>
   </soapenv:Body>
</soapenv:Envelope>`.replace(/\n/g, '');

export const GET_CUSTOMER_METAFIELDS = `#graphql
  query GET_CUSTOMER_METAFIELDS($customerId: ID!) {
    customer(id: $customerId) {
      email
      metafields(first:10) {
        nodes {
          id
          key
          namespace
          value
        }
      }
    }
  }
`;

export const UPDATE_ORDER_METAFIELDS = `#graphql
  mutation UPDATE_ORDER_METAFIELDS(
      $metafields: [MetafieldsSetInput!]!
    ) {
    metafieldsSet(
      metafields: $metafields
    ) {
      metafields {
        id
        key
        namespace
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_ORDER_LINE_ITEM_DISCOUNT_PRICE = `#graphql
  query GET_ORDER_LINE_ITEM_DISCOUNT_PRICE($orderId: ID!) {
    order(id: $orderId) {
      id
      currentTotalDiscountsSet {
        shopMoney {
          amount
        }
      }
      lineItems(first:10) {
        nodes {
          id
          discountedUnitPriceAfterAllDiscountsSet {
            shopMoney {
              amount
            }
          }
        }
      }
    }
  }
`;
