import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '~/components';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    to: {control: 'text'},
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
} satisfies Story;

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Button',
  },
};
