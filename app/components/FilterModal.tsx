import {Dialog} from '@headlessui/react';
import {Button} from './Button';
import {BodyText} from './BodyText';
import {IconClose} from './Icon';
import {FilterSection} from './FilterSection';
import {useSearchParams} from '@remix-run/react';

export type FilterModalTypes = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  collectionName?: string;
  filterList: Record<string, string[]>;
};

export function FilterModal({
  isOpen,
  setIsOpen,
  collectionName,
  filterList,
}: FilterModalTypes) {
  const [searchParams] = useSearchParams();

  const activeFilters = Object.entries(filterList).reduce(
    (acc, [key, values]) => {
      const activeValues = values.filter((value) =>
        searchParams.getAll(key).includes(value),
      );

      if (activeValues.length) {
        acc[key] = activeValues;
      }

      return acc;
    },
    {} as Record<string, string[]>,
  );
  const activeFilterLength = Object.entries(activeFilters).length;

  return (
    <>
      <Button className="flex-1 !text-base" onClick={() => setIsOpen(true)}>
        Filter & Sort
        {activeFilterLength > 0 && <span>{` (${activeFilterLength})`}</span>}
      </Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Panel className="fixed inset-0 w-screen h-screen pb-20 bg-white z-50">
          <Dialog.Title className="bg-neutral-96 p-5 flex justify-between items-center">
            <BodyText level="title-1">Sort & Filter</BodyText>
            <button
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-neutral-92 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <IconClose />
            </button>
          </Dialog.Title>
          <div className="flex flex-col justify-between h-full">
            <div className="py-6 px-5 overflow-y-auto pb-[80px]">
              <FilterSection
                filters={filterList}
                collectionName={collectionName}
              />
            </div>
            <div className="h-20 px-5 py-4 shadow-dropShadow">
              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Show My Results
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
