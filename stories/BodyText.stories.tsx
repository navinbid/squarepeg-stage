import type {Meta, StoryObj} from '@storybook/react';
import {BODY_TEXT_STYLES, BodyText, BodyTextLevel} from '~/components/BodyText';

const meta = {
  title: 'Body Text',
  component: BodyText,
  tags: ['autodocs'],
  argTypes: {
    // to: {control: 'text'},
  },
} satisfies Meta<typeof BodyText>;

export default meta;
type Story = StoryObj<typeof BodyText>;

export const AllBodyText = () => (
  <>
    {Object.keys(BODY_TEXT_STYLES).map((level) => (
      <BodyText
        key={level}
        level={level as BodyTextLevel}
        className="capitalize"
      >
        {level} Text
      </BodyText>
    ))}
  </>
);
