import clsx from 'clsx';
import {Disclosure, Transition} from '@headlessui/react';
import {IconCaret} from './Icon';

export function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Disclosure as="div">
      {({open}) => (
        <>
          <Disclosure.Button className="py-5 w-full flex justify-between items-center">
            <span className="font-bold text-neutral-44 text-xs uppercase tracking-widest">
              {title}
            </span>
            <IconCaret
              height={16}
              width={16}
              direction={open ? 'up' : 'down'}
            />
          </Disclosure.Button>
          <Transition
            enter="transition-transform duration-300 ease-out"
            enterFrom="-translate-y-1 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition-transform duration-100 ease-in"
            leaveFrom="translate-y-0 opacity-300"
            leaveTo="-translate-y-1 opacity-0"
          >
            <Disclosure.Panel static>{children}</Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

export default Accordion;
