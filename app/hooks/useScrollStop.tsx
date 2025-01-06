import React from 'react';

export const createScrollStopListener = (element, callback, timeout = 200) => {
  let removed = false;
  let handle = null;
  const onScroll = () => {
    if (handle) {
      clearTimeout(handle);
    }
    handle = setTimeout(callback, timeout); // default 200 ms
  };
  element.addEventListener('scroll', onScroll);
  return () => {
    if (removed) {
      return;
    }
    removed = true;
    if (handle) {
      clearTimeout(handle);
    }
    element.removeEventListener('scroll', onScroll);
  };
};

export const useScrollStopListener = (callback, timeout = 200) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const callbackRef = React.useRef<() => void>();
  callbackRef.current = callback;
  React.useEffect(() => {
    const destroyListener = createScrollStopListener(
      containerRef.current,
      () => {
        if (callbackRef.current) {
          callbackRef.current();
        }
      },
    );
    return () => destroyListener();
  }, [containerRef.current]);
  return containerRef;
};
