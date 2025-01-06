import {useContext, createContext, useState} from 'react';
import {useMatches} from '@remix-run/react';

const LayoutContext = createContext(null);

function LayoutProvider({children}) {
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartLine, setCartLine] = useState(null);
  const [root] = useMatches();

  const showPromoBanner =
    root?.data?.sanitySettings?.promoBannerVisible &&
    !root?.data?.promoBannerDismissed &&
    root?.data?.sanitySettings?.promoBannerContent;

  const value = {
    cartModalOpen,
    setCartModalOpen,
    cartLine,
    setCartLine,
    showPromoBanner,
    promoBannerContent: root?.data?.sanitySettings?.promoBannerContent,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutContext');
  }
  return context;
}

export {LayoutProvider, useLayoutContext};
