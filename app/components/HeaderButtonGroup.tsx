import {Fragment, useState} from 'react';
import {Popover, Transition} from '@headlessui/react';
import {Link} from '@remix-run/react';

import {
  IconAccount,
  IconCaret,
  IconCircleArrow,
  IconClose,
  IconMenu,
  IconProfileCircle,
} from './Icon';
import {CartCount} from './CartCount';
import {useCustomer} from '~/hooks/useCustomer';

export function HeaderButtonGroup({isHome, openCart, collections}) {
  const customer = useCustomer();
  return (
    <div className="flex items-center gap-3 md:gap-6 order-2 md:order-last">
      <Link
        to={customer ? '/account' : '/account/login'}
        className="relative flex items-center justify-center focus:ring-primary/5"
      >
        <IconProfileCircle className="h-[28px] w-[28px]" />
      </Link>
      <CartCount isHome={isHome} openCart={openCart} />
      {/* Category Selection Mobile only */}
      <div className="flex items-center justify-center w-8 h-8 md:hidden">
        <Popover
          // close popover when URL changes
          className="text-[#0A0A0A] font-semibold z-40 isolate"
        >
          {({open}) => (
            <>
              <Popover.Button>
                {open ? (
                  <IconClose className="w-7 h-7" />
                ) : (
                  <IconMenu
                    stroke="none"
                    className="w-7 h-7"
                    viewBox="0 0 28 28"
                  />
                )}
              </Popover.Button>
              <NavigationPopover collections={collections} />
            </>
          )}
        </Popover>
      </div>
    </div>
  );
}

export function NavigationPopover({collections}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory] =
    collections?.filter(
      (collection) => collection._id === selectedCategoryId,
    ) || [];

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-1"
    >
      <Popover.Panel
        as="div"
        className="absolute left-0 z-50 bg-white w-full flex flex-col divide-y shadow-navDropdown"
      >
        {!selectedCategory ? (
          <>
            <div className="p-5 pt-10 flex">
              <MobileNavHeading>Shop by category</MobileNavHeading>
            </div>
            {collections?.map((collection) => {
              if (
                !collection.store ||
                !collection.subcollections ||
                !collection?.store?.slug ||
                collection?.store?.title === 'Home page'
              )
                return null;
              return (
                <button
                  key={collection._id}
                  className="p-4 flex justify-between bg-white"
                  onClick={() => setSelectedCategoryId(collection._id)}
                >
                  <span>{collection.store.title}</span>
                  <IconCaret direction="left" />
                </button>
              );
            })}

            {/* General Links */}
            <div className="p-5 pt-10 flex bg-white">
              <MobileNavHeading>Account</MobileNavHeading>
            </div>
            {STATIC_NAV_LINKS.map(({label, to}) => {
              return (
                <Popover.Button
                  as={Link}
                  key={label}
                  to={to}
                  className="p-4 flex justify-between bg-white"
                >
                  <span>{label}</span>
                  <IconCaret direction="left" />
                </Popover.Button>
              );
            })}
          </>
        ) : (
          <>
            <div className="flex justify-between p-5 pt-10">
              <Popover.Button
                as={Link}
                onClick={() => setSelectedCategoryId(null)}
                to={`/collections/${selectedCategory?.store?.slug?.current}`}
                className="font-extrabold text-brand text-xs uppercase tracking-widest flex items-center gap-1"
              >
                All {selectedCategory.store.title} <IconCircleArrow />
              </Popover.Button>
              <button
                className="font-bold text-xs uppercase tracking-widest text-brand flex items-center gap-1"
                onClick={() => setSelectedCategoryId(null)}
              >
                <IconCaret direction="right" />
                Back
              </button>
            </div>

            <nav>
              <ul>
                {selectedCategory?.subcollections
                  ?.filter(Boolean)
                  ?.map((subcollection) => (
                    <li key={subcollection._id}>
                      <Popover.Button
                        as={Link}
                        className="flex p-4 bg-white"
                        onClick={() => setSelectedCategoryId(null)}
                        to={`/collections/${selectedCategory?.store?.slug?.current}/${subcollection?.slug?.current}`}
                      >
                        {subcollection?.name}
                      </Popover.Button>
                    </li>
                  ))}
              </ul>
            </nav>
          </>
        )}
      </Popover.Panel>
    </Transition>
  );
}

export function MobileNavHeading({children}) {
  return (
    <h3 className="h-5 font-bold text-neutral-44 text-xs uppercase tracking-widest">
      {children}
    </h3>
  );
}

export const STATIC_NAV_LINKS = [
  {
    label: 'For Pros',
    to: '/pro',
  },

  {
    label: 'My List',
    to: '/account/saved-products',
  },
  {
    label: 'Orders',
    to: '/account/orders',
  },
  // {
  //   label: 'FAQs',
  //   to: '#',
  // },
];
