import {OKENDO_PRODUCT_STAR_RATING_FRAGMENT} from '@okendo/shopify-hydrogen';

export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage {
      url
    }
    ... on MediaImage {
      id
      image {
        url
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`;

export const METAFIELD_QUERY = `
  metafields(identifiers: [
    {
      namespace: "arena",
      key: "minimumQuantity"
    },
    {
      namespace: "arena",
      key:"quantityInterval"
    },
    {
      namespace: "arena",
      key: "weight",
    },
    {
      namespace: "arena",
      key: "manufacturerPartNumber",
    },
    {
      namespace: "custom",
      key: "unit_of_measure",
    }
  ]) {
    id
    key
    value
  }
`;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    publishedAt
    handle
    tags
    ${METAFIELD_QUERY}
    variants(first: 2) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
        }
      }
    }
  }
`;
