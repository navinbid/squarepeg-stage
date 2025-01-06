import { useFetcher } from '@remix-run/react';
import { Button } from './Button';
import { Dialog, RadioGroup } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { Heading, Text } from './Text';
import { Input, TextFieldMask } from './Input';
import { IconClose } from './Icon';
import clsx from 'clsx';
import { parseMetafields } from '~/lib/metafields';

export default function OutOfStockModal({
  variant,
  product,
  buttonClasses,
}: {
  variant: string;
  product: any;
  buttonClasses?: string;
}) {
  const fetcher = useFetcher();
  const success = fetcher?.data?.status === 202;
  const serverError = fetcher?.data?.status === 500;
  const badRequest = fetcher?.data?.status === 400;
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState('email');

  const parsedMetafields = parseMetafields(product.metafields);
  const manufacturerPartNumber = parsedMetafields?.manufacturerPartNumber;

  useEffect(() => {
    fetcher.data = null;
  }, [fetcher, channel]);

  return (
    <>
      {success ? (
        <Button className={buttonClasses} disabled variant="unavailable">
          Signed up!
        </Button>
      ) : (
        <Button
          className={buttonClasses}
          variant="unavailable"
          onClick={() => setIsOpen(true)}
        >
          Notify Me
        </Button>
      )}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="mx-auto max-w-[640px] rounded bg-white py-14 px-11 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute h-10 w-10 top-5 right-5 border border-neutral-8 rounded-full flex justify-center items-center"
            >
              <span className="sr-only">Close Notify Me Modal</span>
              <IconClose />
            </button>
            <fetcher.Form
              method="post"
              action="/api/waitlist"
              className="flex flex-col gap-6"
            >
              <div className="border-b pb-6">
                <Dialog.Title as={Heading} className="mb-4">
                  Notify Me When Available
                </Dialog.Title>
                <Text>
                  We’ll notify you when this product is back in stock.
                </Text>
              </div>
              <div>
                <Heading size="lead" className="font-bold text-2xl mb-2">
                  {product.title}
                </Heading>
                <div className="flex divide-x">
                  <Text className="pr-2">Part #{product.handle}</Text>
                  {Boolean(manufacturerPartNumber) && (
                    <Text className="pl-2">MFG #{manufacturerPartNumber}</Text>
                  )}
                </div>
              </div>
              {/* Tabs */}
              <RadioGroup
                name="channel"
                value={channel}
                onChange={setChannel}
                className="w-full flex flex-row font-semibold"
              >
                <RadioGroup.Label className="sr-only">
                  Contact Method Type
                </RadioGroup.Label>
                <RadioGroup.Option value="email" className="flex flex-1">
                  {({ checked }) => (
                    <div
                      className={clsx(
                        checked && 'border-b border-brand',
                        'flex-1 flex justify-center items-center py-3 cursor-pointer',
                      )}
                    >
                      Email
                    </div>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option value="sms" className="flex flex-1">
                  {({ checked }) => (
                    <div
                      className={clsx(
                        checked && 'border-b border-brand',
                        'flex-1 flex justify-center items-center py-3 cursor-pointer',
                      )}
                    >
                      SMS
                    </div>
                  )}
                </RadioGroup.Option>
              </RadioGroup>
              <div aria-live="polite">
                {badRequest && (
                  <p className="text-error text-xs">
                    Please enter a valid{' '}
                    {channel === 'email' ? 'email address' : 'phone number'}.
                  </p>
                )}
                {channel === 'email' && (
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-label="Email address"
                    placeholder="Email Address"
                    disabled={success}
                    required
                  />
                )}
                {channel === 'sms' && (
                  <TextFieldMask
                    mask="+19999999999"
                    pattern="\+1\d{10}"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone number"
                    aria-label="Phone number"
                    required
                  />
                )}
              </div>
              {/* <label className="flex gap-2 space-2 mx-2.5 items-center">
                <input type="checkbox" name="marketing" />
                Add me to the mailing list for exclusive updates and discounts
              </label> */}
              {serverError && (
                <p className="text-error text-xs">An error occurred.</p>
              )}
              <Button
                className="my-3"
                disabled={success}
                variant={success ? 'unavailable' : 'primary'}
                onClick={() => setIsOpen(true)}
              >
                {success
                  ? 'Signed up!'
                  : channel === 'email'
                    ? 'Email Me'
                    : 'Text Me'}
              </Button>
              <Text>
                You’ll receive a one time email when this product arrives in
                stock. We won’t share your address with anybody else.
              </Text>
              <input hidden name="variant" value={variant} />
            </fetcher.Form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
