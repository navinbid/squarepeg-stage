import { useSearchParams } from '@remix-run/react';
import { IconChevron, IconFilterCancel } from './Icon';
import { useState } from 'react';

export type FilterChipProps = {
  filters: Record<string, string[]>;
};

export function FilterChips({ filters }: FilterChipProps) {
  const [searchParams] = useSearchParams();
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const activeFilters = Object.entries(filters).reduce((acc, [key, values]) => {
    const activeValues = values.filter((value) =>
      searchParams.getAll(key).includes(value),
    );

    if (activeValues.length) {
      acc[key] = activeValues;
    }

    return acc;
  }, {} as Record<string, string[]>);

  const hasAtLeastOneFilter = Object.keys(activeFilters).length > 0;
  const hasMoreThanFiveFilters = Object.keys(activeFilters).length > 5;

  const visibleFilters = showMoreFilters
    ? activeFilters
    : Object.fromEntries(Object.entries(activeFilters).slice(0, 5));

  return (
    <div className="relative h-[38px] my-3 mb-6">
      {/* overlay this on top of the content wrapper paddings. full bleed utility would be nice here */}
      {/* left gutter: 20px, md:32px */}
      <div className="w-auto  flex flex-wrap gap-3  pb-3">
        {hasAtLeastOneFilter && (
          <button
            className="text-[#160E1B] underline text-sm shrink-0"
            onClick={() => {
              const previousSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              const newParams = new URLSearchParams();
              newParams.set('q', previousSearchParams.get('q')!);
              window.location.search = newParams.toString();
            }}
          >
            Clear All
          </button>
        )}
        {Object.entries(visibleFilters).map(([key, values]) => {
          return (
            <>
              {values.map((value) => {
                return (
                  <button
                    className="flex items-center py-2 px-3 rounded-full border border-[#0A0A0A] text-sm shrink-0"
                    key={value}
                    // on click remove filter from search params
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(
                        searchParams.toString(),
                      );
                      newSearchParams.delete(key);
                      newSearchParams.delete(value);
                      window.location.search = newSearchParams.toString();
                    }}
                  >
                    <div className="capitalize">
                      {key}: {value}
                    </div>
                    <div className="flex items-center justify-center ml-2">
                      <IconFilterCancel
                        className="w-auto h-auto"
                        width={16}
                        height={16}
                      />
                    </div>
                  </button>
                );
              })}
            </>
          );
        })}
        {/* {hasMoreThanFiveFilters && (
        <button
          className="text-brand font-semibold text-sm border-[#0A0A0A] border rounded-full py-2 px-3 flex items-center gap-1"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
        >
          {showMoreFilters
            ? 'Show Less'
            : `+${Object.keys(activeFilters).length - 5}`}
          <IconChevron className={showMoreFilters ? 'rotate-180' : ''} />
        </button>
      )} */}
      </div>
    </div>
  );
}
