import {
  useFetcher,
} from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import {

  IconClose,
} from '~/components';

import { parseMetafields } from '~/lib/metafields';


export default function DeletePopUP({ isOpen, setIsOpen, setDelete }) {
  const { load, data } = useFetcher();
  const parsedMetafields = parseMetafields(data?.product?.metafields);
  const manufacturerPartNumber = parsedMetafields?.manufacturerPartNumber;



  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 md:p-16">
          <Dialog.Panel className="rounded bg-white relative px-11 pb-14 pt-12 max-w-[550px] w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="z-10 w-8 h-8 rounded-full border border-neutral-8 absolute top-7 right-7 flex justify-center items-center"
            >
              <IconClose />
            </button>
            <div>
              <h1 className="font-extrabold text-[28px] sm:text-4xl text-neutral-8">
                Delete Account
              </h1>
              <p className="text-base sm:text-lg text-neutral-8 py-7">Are you sure you want to delete your account?</p>
              <div className='grid gap-x-3 gap-y-3 grid-cols-2'>
                <button className="sm:col-span-1 rounded-full text-center p-3 py-0 h-12 font-extrabold transition-colors border-2 border-brand bg-white text-brand hover:text-white hover:bg-brand"
                  onClick={() => {
                    setIsOpen(false); setDelete(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setDelete(true);
                  }}
                  className="sm:col-span-1 inline-block rounded-full text-base text-center p-3 py-0 h-12 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white"
                  type="submit"
                >
                  Confirm
                </button>

              </div>
            </div>

          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

