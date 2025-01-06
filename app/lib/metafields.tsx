export type MetafieldType = {id: string; key: string; value: string};

type ParsedMetafield = {
  [key: string]: string;
};

export function parseMetafields(
  metafields: MetafieldType[],
): Record<string, string> {
  if (!metafields) {
    console.warn('No metafields provided');
    return {};
  }

  return metafields.reduce((acc, metafield) => {
    if (!metafield) return acc;

    return {
      ...acc,
      [metafield.key]: metafield.value,
    };
  }, {});
}
