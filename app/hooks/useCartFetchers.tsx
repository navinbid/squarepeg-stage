import {useFetchers} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {useEffect} from 'react';
import {useLayoutContext} from '~/components/LayoutContext';

export function useCartFetchers(actionName: string) {
  const fetchers = useFetchers();
  const {cartLine, setCartLine} = useLayoutContext();
  const cartFetchers = [];
  useEffect(() => {
    for (const fetcher of fetchers) {
      const formData = fetcher?.formData;
      if (formData) {
        const formInputs = CartForm.getFormInput(formData);
        if (
          formInputs.action === actionName &&
          cartLine?.title !== formInputs.inputs.title
        ) {
          setCartLine({
            title: formInputs.inputs.title,
            handle: formInputs.inputs.handle,
          });
          cartFetchers.push(fetcher);
        }
      }
    }
  }, [fetchers]);

  return cartFetchers;
}
