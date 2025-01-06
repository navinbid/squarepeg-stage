import React from 'react';
import {Heading, Section, Text} from './Text';

export function CopyPageSection({content}) {
  return (
    <Section className="max-w-4xl mx-auto grid grid-cols-1 justify-items-center !my-8">
      {content.map((section) => {
        return (
          <React.Fragment key={section.heading}>
            <Heading className="place-self-start">{section.heading}</Heading>
            {section.paragraphs.map((paragraph, index) => (
              <Text format as="p" className="max-w-4xl" key={index}>
                {paragraph}
              </Text>
            ))}
          </React.Fragment>
        );
      })}
    </Section>
  );
}
