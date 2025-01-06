import type {Meta, StoryObj} from '@storybook/react';
import {Link} from '~/components';

const meta = {
  title: 'Link',
  component: Link,
  tags: ['autodocs'],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    children: 'Link',
    className: 'text-black',
    to: '/',
  },
};
