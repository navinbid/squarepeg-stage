import {useMatches} from '@remix-run/react';

export const useFavoritesList = () => {
  const [root] = useMatches();

  return root.data?.swymList as any | null;
};

export const useIsProductFavorited = (productId: string) => {
  const favoritesList = useFavoritesList();

  return Boolean(
    favoritesList?.listcontents?.find((item: any) => {
      return Number(productId.split('/').at(-1)) === item.empi;
    }),
  );
};
