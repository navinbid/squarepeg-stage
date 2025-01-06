// import React from 'react';
import type { Preview } from '@storybook/react';
// import { unstable_createRemixStub } from "@remix-run/testing";
import '../app/styles/app.css'

// const RemixDecorator = (Story) => {
//   const RemixStub = unstable_createRemixStub([{
//     path: '/',
//     element: <Story />
//   }])

//   return <RemixStub />
// }

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  // decorators: [RemixDecorator]
};

export default preview;
