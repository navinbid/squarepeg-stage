import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { Disclosure } from '@headlessui/react';
import { Input } from './Input';
import { IconSearchInput } from './Icon';
import clsx from 'clsx';
import { SORT_OPTIONS } from './FilterDropdown';

export type FilterSectionProps = {
  filters: Record<string, string[]>;
  collectionName?: string;
};

export const FilterSection = ({
  filters,
  collectionName,
}: FilterSectionProps) => {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  // sort filters alphabetically
  const sortedFilters = Object.fromEntries(
    Object.entries(filters).sort(([a], [b]) => a.localeCompare(b)),
  );

  const activeSort = SORT_OPTIONS.find(
    (sort) => sort.value === searchParams.get('sort'),
  );

  // Construct the defaultValue for the input field
  const vendor = searchParams.get('vendor');
  const query = searchParams.get('q');
  const defaultValue = vendor ? `${vendor} ${query ?? ''}` : query ?? '';

  return (
    <Form method="get" id="filter-form">
      <div className="relative">
        <div className="absolute left-[10px] -translate-y-[50%] top-[50%]">
          <IconSearchInput />
        </div>
        <Input
          className="text-black w-full pl-[38px]"
          type="text"
          name="q"
          placeholder={`Search ${collectionName || 'Products'}`}
          defaultValue={defaultValue as string}
          onBlur={(e) => submit(e.currentTarget.form)}
          onSubmit={(e) => submit(e.currentTarget.form)}
        />
      </div>
      <div className="pb-6 border-b" />
      {Object.entries(sortedFilters).map(([key, values]) => {
        if (!values || !values.length) return null;

        const hasActiveFilters = values.some((value) =>
          searchParams.getAll(key).includes(value),
        );

        return (
          <Disclosure key={key} defaultOpen={hasActiveFilters}>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className={clsx(
                    'w-full flex justify-between text-lg font-bold border-b border-[#E0E0E0] py-3 capitalize',
                  )}
                >
                  <div className="text-left">
                    {key} ({values.length})
                  </div>
                  <div>{open ? '-' : '+'}</div>
                </Disclosure.Button>
                <Disclosure.Panel className="py-4 flex flex-col gap-y-2">
                  {values.map((value) => {
                    if (!value) return null;
                    return (
                      <label
                        key={value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name={key}
                          value={value}
                          onChange={(e) => submit(e.currentTarget.form)}
                          // defaultChecked={searchParams.getAll(key).includes(value)}
                          checked={searchParams.getAll(key).includes(value)}
                          className=" text-black focus:ring-1 focus:ring-offset-2 focus:ring-neutral-8"
                        />
                        <div>{value}</div>
                      </label>
                    );
                  })}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        );
      })}
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              className={clsx(
                'w-full flex justify-between text-lg font-bold border-b border-[#E0E0E0] py-3 capitalize lg:hidden',
              )}
            >
              <div className="text-left">
                Sort By: {activeSort?.name ?? 'Relevance'}
              </div>
              <div>{open ? '-' : '+'}</div>
            </Disclosure.Button>
            <Disclosure.Panel className="py-4">
              {SORT_OPTIONS.map((option) => {
                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      onChange={(e) => submit(e.currentTarget.form)}
                      checked={searchParams.get('sort') === option.value}
                      className=" text-black focus:ring-1 focus:ring-offset-2 focus:ring-neutral-8"
                    />
                    <div>{option.name}</div>
                  </label>
                );
              })}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </Form>
  );
};
