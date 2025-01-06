import {
  type EnhancedMenu,
  type EnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
  IconLogoWithText,
  IconAlertBarClose,
  IconArrowRight,
  IconExternalLink,
  Button,
  Accordion,
  FooterLink,
  HeaderCollectionsBar,
  HeaderLogo,
  HeaderSearch,
  HeaderButtonGroup,
  CartCount,
} from '~/components';
import { Popover, Transition } from '@headlessui/react';
import {
  useParams,
  Form,
  Await,
  useMatches,
  useHref,
  useLocation,
  Links,
  useFetcher,
} from '@remix-run/react';
import { useLocalStorage, useWindowScroll } from 'react-use';
import { Disclosure } from '@headlessui/react';
import { Fragment, Suspense, useEffect, useMemo } from 'react';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { useCartFetchers } from '~/hooks/useCartFetchers';
import type { LayoutData } from '../root';
import { SanitySettings } from '~/lib/sanity-types';
import { SanityCollectionWithSubcollections } from '~/lib/sanity';
import clsx from 'clsx';
import fullLogo from '../../public/logo-full.svg';
import { SOCIAL_LINKS } from '~/data/social-links';
import { TextField } from './Input';
import { CartForm } from '@shopify/hydrogen';
import CartModal from './CartModal';
import { LayoutProvider, useLayoutContext } from './LayoutContext';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@sanity/types';
import Visa from '~/assets/Visa_Logo.png';
import Master from '~/assets/Master_Logo.png';
import American from '~/assets/American_Express.png';
import Discover from '~/assets/Discover_Logo.png';
import Paypal from '~/assets/Paypal_Logo.png';
import ApplePay from '~/assets/Apple_Pay_Logo.png';

export function Layout({
  children,
  layout,
  settings,
  collections,
}: {
  children: React.ReactNode;
  layout: LayoutData;
  settings: SanitySettings;
  collections: SanityCollectionWithSubcollections[];
}) {
  const headerMenu = {
    items: settings?.menu?.links?.map((link) => ({
      ...link,
      to: link?.url ?? '',
    })),
  };

  const footerMenu = {
    items: settings?.footer?.links?.map((link) => ({
      ...link,
      to: link?.url ?? '',
    })),
  };

  return (
    <>
      <div className="flex flex-col min-h-[50vh]">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <LayoutProvider>
          <Header
            // @ts-ignore
            menu={headerMenu}
            collections={collections}
          />
          <main role="main" id="mainContent" className="flex-grow">
            {children}
          </main>
        </LayoutProvider>
      </div>
      {/* @ts-ignore */}
      <Footer menu={footerMenu} settings={settings} />
    </>
  );
}

function Header({
  menu,
  collections,
}: {
  title: string;
  menu?: EnhancedMenu;
  collections: SanityCollectionWithSubcollections[];
}) {
  const { showPromoBanner, promoBannerContent } = useLayoutContext();
  const isHome = useIsHomePath();
  const { y } = useWindowScroll();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const { cartModalOpen, setCartModalOpen } = useLayoutContext();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  // toggle cart modal when adding to cart
  useEffect(() => {
    if (cartModalOpen || !addToCartFetchers.length) return;
    setCartModalOpen(true);
  }, [addToCartFetchers, cartModalOpen, setCartModalOpen]);

  // remove unwanted collections and sort them for Navbar
  const filteredCollections =
    collections
      ?.filter(
        (collection) =>
          collection?.subcollections?.length > 0 &&
          collection?.store?.slug &&
          collection?.store?.title != 'Home page' &&
          !collection?.store?.isDeleted,
      )
      .sort((a, b) => a.store?.index - b.store?.index) || [];

  return (
    <>
      {/* <CartDrawer isOpen={isCartOpen} onClose={closeCart} /> */}
      {/* {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )} */}

      <div className="z-30 relative shadow-navDropdown">
        {showPromoBanner && (
          <PromoBanner>
            <PortableText value={promoBannerContent} />
          </PromoBanner>
        )}
        <UtilityBar />
        <header
          role="banner"
          className={`${isHome ? 'bg-white' : 'bg-white text-primary'} ${!isHome && y > 50 && ''
            } lg:flex z-40 justify-center items-center w-full leading-none gap-8 py-3`}
        >
          <div className="relative flex flex-1 flex-row flex-wrap justify-between items-center content-wrapper gap-y-4 md:gap-x-10">
            {/* Logo */}
            <HeaderLogo />
            {/* Search Bar */}
            <HeaderSearch />
            {/* Button Group */}
            <HeaderButtonGroup
              isHome={isHome}
              openCart={openCart}
              collections={filteredCollections}
            />
          </div>
        </header>
        {/* Collections */}
        <HeaderCollectionsBar collections={filteredCollections} />
        <CartModal />
      </div>
    </>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}

// function MobileHeader({
//   title,
//   isHome,
//   openCart,
//   openMenu,
// }: {
//   title: string;
//   isHome: boolean;
//   openCart: () => void;
//   openMenu: () => void;
// }) {
//   // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

//   const params = useParams();

//   return (
//     <header
//       role="banner"
//       className={`${
//         isHome
//           ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
//           : 'bg-contrast/80 text-primary'
//       } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
//     >
//       <div className="flex items-center justify-start w-full gap-4">
//         <Form
//           method="get"
//           action={params.lang ? `/${params.lang}/search` : '/search'}
//           className="items-center gap-2 sm:flex"
//         >
//           <button
//             type="submit"
//             className="relative flex items-center justify-center w-8 h-8"
//           >
//             <IconSearch />
//           </button>
//           <Input
//             className={
//               isHome
//                 ? 'focus:border-contrast/20 dark:focus:border-primary/20'
//                 : 'focus:border-primary/20'
//             }
//             type="search"
//             variant="minisearch"
//             placeholder="Search"
//             name="q"
//           />
//         </Form>
//       </div>

//       <div className="flex items-center justify-end w-full gap-4">
//         <Link
//           to="/account"
//           className="relative flex items-center justify-center w-8 h-8"
//         >
//           <IconAccount />
//         </Link>
//         <CartCount isHome={isHome} openCart={openCart} />
//         <button
//           onClick={openMenu}
//           className="relative flex items-center justify-center w-8 h-8"
//         >
//           <IconMenu stroke="black" className="w-7 h-7" viewBox="0 0 28 28" />
//         </button>
//       </div>
//     </header>
//   );
// }

function PromoBanner({ children }: { children: React.ReactNode }) {
  const fetcher = useFetcher();
  const optimisticDismissed = fetcher?.formData?.get('dismiss') === 'true';

  if (optimisticDismissed) return;

  return (
    <div className="w-full bg-brand text-contrast text-xs">
      <div className="content-wrapper">
        <div className="flex items-center justify-center relative w-full h-11 md:h-8">
          <div className="block text-center mx-12">{children}</div>
          <fetcher.Form action="/api/promo" method="post">
            <input type="hidden" name="dismiss" value="true" />
            <button className="absolute inset-y-0 right-0 my-auto flex items-center justify-center w-8 h-8 text-contrast">
              <IconAlertBarClose className="white" />
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}

const UTILITY_BAR_LINKS = [
  { to: '/pro', title: 'For PROs', bold: true },
  { to: '/account/saved-products', title: 'My List' },
  { to: '/account/orders', title: 'Orders' },
  { to: '/pages/faq-page', title: 'FAQs' },
];

// @TODO: Check if this should only show when logged in
function UtilityBar() {
  return (
    <div className="w-full bg-neutral-96">
      <div className="content-wrapper">
        <div className="flex h-8 py-2 items-center justify-end space-x-5 text-xs">
          {UTILITY_BAR_LINKS.map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className={clsx(link.bold ? 'font-extrabold' : 'font-semibold')}
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer({
  menu,
  settings,
}: {
  menu?: EnhancedMenu;
  settings?: SanitySettings;
}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  const linkSections = {
    about: settings?.footer?.links?.map((link) => ({
      ...link,
      to: link?.url,
      // target: link.target,
    })),
    'customer service': settings?.footer?.customerServiceLinks?.map((link) => ({
      ...link,
      to: link?.url,
    })),
    'quick links': settings?.footer?.quickLinks?.map((link) => ({
      ...link,
      to: link?.url,
    })),
  };
  const fetcher = useFetcher();

  return (
    <div className="bg-neutral-98 border-t border-primary/05">
      <footer
        role="contentinfo"
        className={`grid content-wrapper min-h-[25rem] items-start grid-flow-row py-8 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-12 overflow-hidden`}
      >
        <div className="md:max-w-[192px] col-span-full md:col-span-3">
          <img src={fullLogo} alt="Logo" className="w-[185px] mb-8" />
          <p>
            Have a question or need assistance? We&apos;re just a phone call
            away! Reach out to our friendly team.
          </p>
          <p className="mt-4 font-bold whitespace-nowrap">
            Call: <a href="tel:8554558446">(855) 455-8446</a>
          </p>
        </div>
        {Object.entries(linkSections).map(([title, links]) => (
          <nav
            key={title}
            className="hidden md:flex md:flex-col md:gap-4 md:col-span-3 lg:col-span-2"
          >
            <h3 className="font-bold text-neutral-44 text-xs uppercase tracking-widest">
              {title}
            </h3>
            <ul className="flex flex-col gap-4">
              {links?.map((link) => {
                return (
                  <li key={link.to}>
                    <FooterLink link={link} />
                  </li>
                );
              })}
              {title === 'customer service' && (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a
                  href="#"
                  className="termly-display-preferences font-semibold flex gap-1 items-center text-neutral-8"
                >
                  Consent Preferences
                </a>
              )}
            </ul>
          </nav>
        ))}
        <nav className="divide-y border-b block md:hidden col-span-full mb-8">
          {Object.entries(linkSections).map(([title, links]) => (
            <Accordion title={title} key={title}>
              <ul className="flex flex-col gap-4 mb-8">
                {links?.map((link) => {
                  return (
                    <li key={link.to}>
                      <FooterLink link={link} />
                    </li>
                  );
                })}
              </ul>
            </Accordion>
          ))}
        </nav>
        <div className="col-span-full lg:col-span-3 max-w-xs flex flex-col justify-self-center">
          <h4 className="font-bold text-lg leading-6 text-center lg:text-left mb-2">
            Subscribe For More
          </h4>
          <p className="text-center lg:text-left">
            Be the first to know about new products, brands, and discounts. Join
            now!
          </p>
          <fetcher.Form
            method="post"
            action="/api/subscribe"
            className="flex flex-col space-y-2 mt-6"
          >
            {fetcher?.data?.status === 500 && (
              <p className="text-xs text-error">An error occurred.</p>
            )}
            {fetcher?.data?.status === 400 && (
              <p className="text-xs text-error">Please enter a valid email.</p>
            )}
            <Input
              disabled={fetcher?.data?.status === 202}
              error={
                (fetcher?.data?.status === 500 ||
                  fetcher?.data?.status === 400) &&
                'Error.'
              }
              required
              className="bg-neutral-92 border-none rounded-full p-3 pl-6"
              type="text"
              placeholder="Enter Your Email*"
              name="email"
            />
            {fetcher?.data?.status === 202 ? (
              <Button disabled>You&apos;re Signed up!</Button>
            ) : (
              <Button type="submit" disabled={fetcher?.state === 'submitting'}>
                {fetcher?.state === 'submitting' ? '...' : 'Sign Up'}
              </Button>
            )}
          </fetcher.Form>
        </div>
        <div className="col-span-full lg:col-span-4 grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-6 gap-4 mt-8 sm:mt-0">
          <div className="flex justify-center items-center">
            <img src={Visa} alt="Footer logo" className="object-contain" />
          </div>
          <div className="flex justify-center items-center">
            <img src={Master} alt="Footer logo" className="object-contain" />
          </div>
          <div className="flex justify-center items-center">
            <img src={American} alt="Footer logo" className="object-contain" />
          </div>
          <div className="flex justify-center items-center">
            <img src={Discover} alt="Footer logo" className="object-contain" />
          </div>
          <div className="flex justify-center items-center">
            <img src={Paypal} alt="Footer logo" className="object-contain" />
          </div>
          <div className="flex justify-center items-center">
            <img src={ApplePay} alt="Footer logo" className="object-contain" />
          </div>
        </div>
        {/* <FooterMenu menu={menu} /> */}
        <div className="flex w-full flex-col lg:flex-row items-center lg:justify-between col-span-full pt-8 gap-y-5">
          <div
            className={`flex flex-col items-center lg:flex-row gap-3 self-center lg:self-end whitespace-nowrap text-neutral-8`}
          >
            © SquarePeg {new Date().getFullYear()}. All Rights Reserved
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/accessibility-policy">Accessibility Policy</Link>
          </div>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-neutral-80 hover:text-primary transition-colors"
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
        {/* <div className="flex gap-8"></div> */}
      </footer>
    </div>
  );
}

// const FooterLink = ({item}: {item: EnhancedMenuItem}) => {
//   if (item.to.startsWith('http')) {
//     return (
//       <a href={item.to} target={item.target} rel="noopener noreferrer">
//         {item.title}
//       </a>
//     );
//   }

//   return (
//     <Link to={item.to} target={item.target} prefetch="intent">
//       {item.title}
//     </Link>
//   );
// };

// function FooterMenu({menu}: {menu?: EnhancedMenu}) {
//   const styles = {
//     section: 'grid gap-4',
//     nav: 'grid gap-2 pb-6',
//   };

//   return (
//     <>
//       {(menu?.items || []).map((item: EnhancedMenuItem) => (
//         // @ts-ignore
//         <section key={item._key} className={styles.section}>
//           <Disclosure>
//             {({open}) => (
//               <>
//                 <Disclosure.Button className="text-left md:cursor-default">
//                   <Heading className="flex justify-between" size="lead" as="h3">
//                     {item.title}
//                     {item?.items?.length > 0 && (
//                       <span className="md:hidden">
//                         <IconCaret direction={open ? 'up' : 'down'} />
//                       </span>
//                     )}
//                   </Heading>
//                 </Disclosure.Button>
//                 {item?.items?.length > 0 ? (
//                   <div
//                     className={`${
//                       open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
//                     } overflow-hidden transition-all duration-300`}
//                   >
//                     <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
//                       <Disclosure.Panel static>
//                         <nav className={styles.nav}>
//                           {item.items.map((subItem) => (
//                             <FooterLink key={subItem.id} item={subItem} />
//                           ))}
//                         </nav>
//                       </Disclosure.Panel>
//                     </Suspense>
//                   </div>
//                 ) : null}
//               </>
//             )}
//           </Disclosure>
//         </section>
//       ))}
//     </>
//   );
// }
