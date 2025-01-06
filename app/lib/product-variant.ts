import {
  PRO_SESSION_MEMBERSHIP_VALUE,
  PRO_VARIANT_TITLE,
  PRO_SESSION_MEMBERSHIP_KEY,
} from './const';

// return Pro variants if isPro status
// needs to be changed to check variant name as well
export function getVariantsByUserProStatus(product, context) {
  return product.variants.nodes.filter(
    (variant) =>
      variant.title.includes(PRO_VARIANT_TITLE) ===
      (context.session?.get(PRO_SESSION_MEMBERSHIP_KEY) ===
        PRO_SESSION_MEMBERSHIP_VALUE),
  );
}
