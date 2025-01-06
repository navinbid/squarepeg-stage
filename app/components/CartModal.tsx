import {Await, useMatches} from '@remix-run/react';
import {useEffect, Suspense, useState, Fragment} from 'react';
import {Link} from '@remix-run/react';
import {Dialog, Transition} from '@headlessui/react';

import {Button} from './Button';
import {Heading, Text} from './Text';
import {IconClose} from './Icon';
import {useLayoutContext} from './LayoutContext';
import clsx from 'clsx';
import {MultipassCheckoutButton} from './MultipassCheckoutButton';

export default function CartModal() {
  const MODAL_DURATION = 5000;
  const ANIMATION_OUT_DURATION = 1000;
  const [root] = useMatches();
  const {
    cartModalOpen,
    setCartModalOpen,
    cartLine,
    setCartLine,
    showPromoBanner,
  } = useLayoutContext();
  const [animatingOut, setAnimatingOut] = useState(false);

  function closeModal() {
    setAnimatingOut(true);
    const animationOutTimeout = setTimeout(() => {
      setAnimatingOut(false);
      setCartLine({
        title: '',
        handle: '',
      });
      setCartModalOpen(false);
    }, ANIMATION_OUT_DURATION);
  }

  // automatically close the modal after 5 seconds
  useEffect(() => {
    if (cartModalOpen) {
      const modalTimeout = setTimeout(() => {
        closeModal();
      }, MODAL_DURATION);

      return () => {
        clearTimeout(modalTimeout);
      };
    }
  }, [cartModalOpen, setCartModalOpen]);

  return (
    <Dialog
      open={cartModalOpen}
      onClose={() => setCartModalOpen(false)}
      className={clsx(
        animatingOut ? 'animate-slideUp' : 'animate-slideDown',
        showPromoBanner ? 'lg:mt-[182px]' : 'lg:mt-[150px]',
        'absolute w-full right-0 isolate z-50',
      )}
    >
      {/* don't use wrapper here because of padding */}
      <div className="box-content max-w-[1312px] mx-auto px-0 md:px-8 lg:px-12">
        <Suspense fallback={<>Loading...</>}>
          <Await resolve={root.data?.cart}>
            {(cart) => {
              return (
                <Dialog.Panel className="bg-white py-6 px-8 relative rounded-b-lg sm:max-w-xs ml-auto shadow-xl">
                  <button
                    onClick={() => setCartModalOpen(false)}
                    className="absolute h-10 w-10 top-4 right-4 border border-neutral-8 rounded-full flex justify-center items-center"
                  >
                    <IconClose />
                  </button>

                  <Dialog.Title
                    as={Heading}
                    size="lead"
                    className="border-b py-2"
                  >
                    Item was added to cart
                  </Dialog.Title>
                  {/* Show Line Added */}
                  {cartLine?.title && cartLine.handle && (
                    <div className="flex flex-col gap-1 my-4">
                      <Text as="h3" className="text-base lg:text-lg font-bold">
                        {cartLine?.title}
                      </Text>
                      <Text className="text-sm"> Part #{cartLine.handle}</Text>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 items-center">
                    <Link to="/cart" className="w-full rounded-full">
                      <Button
                        tabIndex={-1}
                        variant="secondary"
                        className="w-full"
                        onClick={() => setCartModalOpen(false)}
                      >
                        View cart ({cart?.totalQuantity || 0})
                      </Button>
                    </Link>
                    <MultipassCheckoutButton checkoutUrl={cart?.checkoutUrl}>
                      Check Out
                    </MultipassCheckoutButton>
                    <Button
                      onClick={() => setCartModalOpen(false)}
                      variant="tertiary"
                    >
                      Continue shopping
                    </Button>
                  </div>
                </Dialog.Panel>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </Dialog>
  );
}
