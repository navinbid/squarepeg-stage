import {useEffect} from 'react';

const GTM_ID = 'GTM-KN6RB2JB';

function GTMContainerScript() {
  useEffect(() => {
    // Data Layer Initialization
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});

    // Creating and Injecting the GTM Script
    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    const newLocal = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    scriptElement.src = newLocal;
    scriptElement.id = 'GTM-KN6RB2JB';

    // insert at beginning of head tag
    document.head.insertBefore(scriptElement, document.head.firstChild);
  }, []);

  return null; // No need to render anything
}

export default GTMContainerScript;
