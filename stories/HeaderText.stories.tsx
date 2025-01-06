import type {Meta, StoryObj} from '@storybook/react';
import {
  HEADER_LEVEL_STYLES,
  HeaderText,
  HeaderTextLevel,
} from '~/components/HeaderText';

const meta = {
  title: 'Header Text',
  component: HeaderText,
  tags: ['autodocs'],
  argTypes: {
    // to: {control: 'text'},
  },
} satisfies Meta<typeof HeaderText>;

export default meta;
type Story = StoryObj<typeof HeaderText>;

export const AllHeaderText = () => (
  <>
    {Object.keys(HEADER_LEVEL_STYLES).map((level) => (
      <HeaderText
        key={level}
        level={level as HeaderTextLevel}
        className="capitalize"
      >
        {level === 'display' ? level : `T${level}`} Text
      </HeaderText>
    ))}
  </>
);

export const DisplayText: Story = {
  args: {
    level: 'display',
    children: 'Display Text',
  },
};

export const T1Text: Story = {
  args: {
    level: '1',
    children: 'T1 Text',
  },
};

export const T1TextUnderline: Story = {
  args: {
    level: '1',
    underline: true,
    children: 'T1 Text',
  },
};

export const T2Text: Story = {
  args: {
    level: '2',
    children: 'T2 Text',
  },
};

export const T3Text: Story = {
  args: {
    level: '3',
    children: 'T3 Text',
  },
};
