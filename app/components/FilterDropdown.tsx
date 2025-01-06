import {Listbox} from '@headlessui/react';
import {BodyText} from './BodyText';
import {IconDropdownCaret} from './Icon';
import clsx from 'clsx';

export type FilterOption = {
  name: string;
  value: string;
};

export type FilterDropdownProps = {
  options: FilterOption[];
  value: FilterOption;
  onChange: (filter: FilterOption) => void;
};

export const SORT_OPTIONS = [
  {name: 'Relevance', value: 'RELEVANCE'},
  {name: 'Price: Low to High', value: 'PRICE'},
  {name: 'Price: High to Low', value: 'PRICE_REVERSE'},
  {name: 'Popularity', value: 'BEST_SELLING'},
] as FilterOption[];

export function FilterDropdown({
  options,
  value,
  onChange,
}: FilterDropdownProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="flex items-center">
          {({open}) => (
            <>
              <div>
                <span className="font-bold">Sort by: </span> {value.name}{' '}
              </div>
              <IconDropdownCaret className={clsx(open ? 'rotate-180' : '')} />
            </>
          )}
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[176px] right-0 z-[300]">
          {options.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option}
              className={({active}) =>
                `relative cursor-default select-none py-2 px-3 ${
                  active ? 'bg-neutral-98' : 'bg-white'
                }`
              }
            >
              <BodyText level="subtitle-1">{option.name}</BodyText>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}
