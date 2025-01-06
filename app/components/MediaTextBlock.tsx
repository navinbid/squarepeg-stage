import clsx from 'clsx';
import {Heading} from './Text';
import {ReactNode} from 'react';

export default function MediaTextBlock({
  firstContent,
  media,
  title,
  children,
}: {
  firstContent: 'media' | 'text';
  media: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        'bg-white flex items-stretch flex-wrap',
        firstContent === 'text' ? 'lg:flex-row-reverse' : 'lg:flex-row',
      )}
    >
      <div className="basis-full lg:basis-1/2 bg-gray-400 min-h-[335px] lg:min-h-[480px]">
        <img
          src={media}
          alt="placeholder"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="basis-full lg:basis-1/2 px-5 lg:px-20 pt-12 pb-16 flex flex-col justify-center">
        <div>
          <Heading className="mb-8 text-neutral-8 text-4xl leading-10">
            {title}
          </Heading>
          {children}
        </div>
      </div>
    </div>
  );
}
