import clsx from 'clsx';
import {Text} from '~/components';

export function Benefits({
  orientation = 'horizontal',
  content,
}: {
  orientation: 'horizontal' | 'vertical';
  content: Array<{title: string; description: string; icon: JSX.Element}>;
}) {
  return (
    <div
      className={clsx(
        'grid  gap-x-8 gap-y-6',
        orientation === 'horizontal'
          ? 'grid-cols-6 justify-start'
          : 'grid-cols-12 justify-center',
      )}
    >
      {content.map((item) => (
        <div
          key={item.title}
          className={clsx(
            'flex',
            orientation === 'horizontal'
              ? 'flex-row gap-x-5 col-span-full md:col-span-3 lg:col-span-2'
              : 'flex-col gap-y-4 items-center text-center col-span-full md:col-span-6 lg:col-span-3',
          )}
        >
          <div className="flex flex-shrink-0 items-center justify-center bg-lime-90 rounded-full w-16 h-16">
            {item.icon}
          </div>
          <div className="flex-shrink-1">
            <Text as="h3" className="font-semibold text-[#0A0A0A] text-lg">
              {item.title}
            </Text>
            <Text as="p" width="narrow" className="text-neutral-44 mt-1">
              {item.description}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}
