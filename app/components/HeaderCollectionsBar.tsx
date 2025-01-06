import { Fragment, useEffect, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Link } from '@remix-run/react';
import clsx from 'clsx';

import { IconCircleArrow } from './Icon';
import { useMeasure } from 'react-use';

export function HeaderCollectionsBar({ collections }) {
  const [navItemWidths, setNavItemWidths] = useState(
    Array(collections.length).fill(0),
  );
  const [containerRef, { width: containerWidth }] = useMeasure();
  const [firstHiddenIndex, setFirstHiddenIndex] = useState(null);

  // Update the navItemWidths array with the width of the nav item at the given index
  function UpdateNavItemWidth(index, width) {
    // if the width didn't change, no update
    if (navItemWidths[index] === width) return;
    setNavItemWidths((prev) => {
      const next = [...prev];
      next[index] = width;
      return next;
    });
  }

  // When navbar size changes or the navItemWidths change, find the first hidden item
  useEffect(() => {
    // ignore when the refs are not ready
    if (
      containerWidth === 0 ||
      navItemWidths.filter((n) => n === 0).length === navItemWidths.length
    )
      return;
    let index = 0;
    // the last item (View More) is always visible
    let totalWidth = navItemWidths[collections.length - 1];
    while (totalWidth + navItemWidths[index] < containerWidth) {
      totalWidth += navItemWidths[index];
      index++;
    }
    // update the first index that can't fit in container if it has changed
    if (index !== firstHiddenIndex) setFirstHiddenIndex(index);
  }, [containerWidth, navItemWidths]);

  // console.log(collections.subcollection.slug.current);
  return (
    <div className="w-full shadow-navDropdown bg-white">
      <div className="bg-white h-12 hidden md:block content-wrapper px-6 md:px-8 lg:px-12 z-50">
        <div className="flex items-center relative gap-10" ref={containerRef}>
          {/* Visible Links */}
          {collections?.map((collection, index) => {
            return (
              <HeaderCollectionsPopover
                title={collection?.store?.title}
                key={collection?.store?.gid}
                index={index}
                updateNavItemWidth={UpdateNavItemWidth}
                firstHiddenIndex={firstHiddenIndex}
              >
                <Popover.Button
                  as={Link}
                  to={`/collections/${collection?.store?.slug?.current}`}
                  className="text-brand font-extrabold flex items-center gap-1 pb-4 border-b border-[#CCC] mb-4"
                >
                  All {collection.store.title} <IconCircleArrow />
                </Popover.Button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                  {collection?.subcollections
                    ?.filter(Boolean)
                    .map((subcollection) => (
                      <Popover.Button
                        as={Link}
                        key={subcollection?._id}
                        to={`/collections/${collection?.store?.slug?.current}/${subcollection?.slug?.current}`}
                      >
                        {subcollection?.name}
                      </Popover.Button>
                    ))}
                  {!collection.subcollections && (
                    <Popover.Button
                      as={Link}

                      key={collection?.store?.gid}
                      to={`/collections/${collection?.store?.slug?.current}`}
                    >
                      {collection?.store?.title}
                    </Popover.Button>
                  )}
                </div>
              </HeaderCollectionsPopover>
            );
          })}
          {/* View More overflow */}
          <HeaderCollectionsPopover
            title="View More"
            index={collections.length}
            updateNavItemWidth={UpdateNavItemWidth}
            firstHiddenIndex={firstHiddenIndex}
          >
            <div className="flex flex-row gap-8 flex-wrap">
              {/* Slice off the hidden items for the popover  */}
              {Boolean(firstHiddenIndex) &&
                collections.slice(firstHiddenIndex).map((collection, index) => {
                  return (
                    <HeaderCollectionsPopoverLinkSection
                      collection={collection}
                      key={collection.store.gid}
                      index={index}
                    />
                  );
                })}
            </div>
          </HeaderCollectionsPopover>
        </div>
      </div>
    </div>
  );
}

export function HeaderCollectionsPopoverLinkSection({ collection, index }) {
  return (
    <div>
      <Popover.Button
        as={Link}
        to={`/collections/${collection?.store?.slug?.current}`}
        className="text-brand font-extrabold flex items-center gap-1 pb-4 border-b border-[#CCC] mb-4"
      >
        All {collection?.store?.title} <IconCircleArrow />
      </Popover.Button>
      <div className="flex flex-col gap-y-4 max-w-xs">
        {collection?.subcollections?.filter(Boolean)?.map((subcollection) => (
          <Popover.Button
            as={Link}
            key={subcollection._id}

            to={`/collections/${collection?.store?.slug?.current}/${subcollection?.slug?.current}`}
          >
            {subcollection?.name}
          </Popover.Button>
        ))}
      </div>
    </div>
  );
}

export function HeaderCollectionsPopover({
  title,
  index,
  updateNavItemWidth,
  firstHiddenIndex,
  children,
}) {
  const [navItemRef, { width }] = useMeasure();

  useEffect(() => {
    // ignore when the refs are not ready
    if (width > 0) {
      // add paddings since width didn't include them
      updateNavItemWidth(index, index === 0 ? width + 20 : width + 40);
    }
  }, [width]);

  return (
    <Popover
      // close popover when URL changes
      className={clsx(
        'text-[#0A0A0A] font-semibold z-40',
        title != 'View More' &&
        index >= firstHiddenIndex &&
        firstHiddenIndex !== null &&
        'hidden',
      )}
      ref={navItemRef}
    >
      {({ open }) => (
        <>
          <Popover.Button
            className={clsx(
              'relative inline-flex focus:outline-none outline-none focus:ring-0 py-3 whitespace-nowrap',
              open && 'shadow-insetBrand',
            )}
          >
            {title}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Popover.Panel
              as="div"
              className="absolute border-t inset-x-0 z-50 bg-white rounded-b-lg py-12 px-[72px] shadow-navDropdown"
            >
              {children}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
