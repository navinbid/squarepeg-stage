import {useEffect, useState} from 'react';

function useElementWidth(ref) {
  const [elementWidth, setElementWidth] = useState(null);

  const updateWidth = () => {
    if (ref.current) {
      const width = ref.current.offsetWidth;
      setElementWidth(width);
    }
  };

  useEffect(() => {
    updateWidth(); // Initial calculation

    const handleResize = () => {
      updateWidth(); // Recalculate on window resize
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref]);

  return elementWidth;
}

export default useElementWidth;
