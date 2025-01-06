import { Heading, IconCaret, IconLiveChat, Text } from '~/components';
import { SOCIAL_LINKS } from '~/data/social-links';
import ImagePerson from '~/assets/contact-person.jpg';
import SquareLogo from '~/assets/logo-only.svg';
import { Listbox } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export const handle = {
  seo: {
    title: 'Contact Square Peg',
    description: 'Contact SquarePeg today!',
  },
};

// Window.GorgiasChat.open() from Gorgias
declare global {
  interface Window {
    GorgiasChat: any;
  }
}

export default function ContactPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script['data-gorgias-contact-form'] = 'script';
    script.defer = true;
    script.src =
      'https://contact.gorgias.help/api/contact-forms/loader.js?uid=3ufg9sr8&locale=en-US';
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="relative">
      <div className="bg-primary-green absolute top-0 left-0 w-full min-h-[38%] lg:h-full lg:w-1/2">
        <div
          className="z-10 absolute bottom-0 h-[119px] lg:h-[191px] lg:mb-10 w-full"
          style={{ backgroundImage: `url(${SquareLogo})` }}
        ></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-y-[88px] content-wrapper">
        {/* Info */}
        <div className="bg-primary-green text-white pt-[88px] pb-12 lg:pt-32 lg:pb-44 relative grid-span-1 h-screen">
          <div className="mr-auto max-w-[448px] flex flex-col gap-6">
            <Heading className="!text-[48px] !font-extrabold leading-[56px]">
              Contact
            </Heading>
            <Text
              size="lead"
              width="narrow"
              className="!text-[26px] leading-9 text-neutral-80"
            >
              Have a question or need assistance? We&apos;re just a phone call
              away! Reach out to our friendly team.
            </Text>
            <div className="flex flex-col gap-2">
              <Text className="font-bold text-xs uppercase tracking-widest">
                PHONE
              </Text>
              <Text className="!text-[18px] leading-7">(855) 455-8446</Text>
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-bold text-xs uppercase tracking-widest">
                CONNECT
              </Text>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 w-12 p-3 border border-white rounded-full flex justify-center items-center"
                  >
                    <link.icon className="fill-white" />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-bold text-xs uppercase tracking-widest">
                ADDRESS
              </Text>
              <Text className="!text-[18px] leading-7">
                Post Office Box 5738<br />
                Meridian, MS 39302
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-bold text-xs uppercase tracking-widest">
                HOURS OF OPERATION
              </Text>
              <Text className="!text-[18px] leading-7">
                Monday - Friday 7:00 am - 5:00 pm CST<br />
                Closed on Major Holidays
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Text className="font-bold text-xs uppercase tracking-widest">
                EMAIL
              </Text>
              <Text className="!text-[18px] leading-7">
                Contact@SquarePegSupply.com
              </Text>
            </div>
          </div>
        </div>
        {/* Form */}
        <div id="form" className="bg-white lg:py-32 min-h-[1500px] z-20 mt-[200px] lg:mt-0">
          <div className="ml-auto lg:max-w-[560px]">
            <HereToHelp />
            {/* Gorgias */}
            <div data-gorgias-contact-form="container"></div>

            {/* <Form method="post" encType="multipart/form-data">
            <Heading className="mb-4">Email Us</Heading>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              <TextField
                required
                label="First Name"
                placeholder="First Name"
                name="firstName"
              />
              <TextField
                required
                label="Last Name"
                placeholder="Last Name"
                name="lastName"
              />
              <TextField
                required
                name="email"
                label="Email Address"
                placeholder="email@address.com"
                type="email"
              />
              <TextField
                required
                name="phone"
                label="Phone Number"
                placeholder="(xxx) xxx-xxxx"
                type="tel"
              />
              <CustomSelect
                name="service"
                required={true}
                label="Service of Interest"
                options={ServicesOfInterest}
              />
              <CustomSelect
                name="contactMethod"
                required={true}
                label="Prefered Method of Contact"
                options={MethodsOfContact}
              />
              <div className="col-span-2">
                <label className="flex flex-col gap-2 text-sm text-neutral-8 ">
                  File Upload
                  <input
                    name="file"
                    type="file"
                    className="file:bg-transparent file:px-4 file:mr-4 file:ml-4 file:py-2 file:rounded-md file:border border-dashed bg-white rounded border border-neutral-80 py-3 focus:border-brand focus:ring-0 invalid:border-error invalid:ring-0"
                  />
                </label>
              </div>
              <div className="col-span-2">
                <TextArea
                  name="message"
                  label="Message"
                  placeholder="Message"
                  className="min-h-[240px]"
                ></TextArea>
              </div>
            </div>
            <Button className="mt-8 mb-24 lg:mb-0" type="submit">
              Send Message
            </Button>
          </Form> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function HereToHelp() {
  function OpenGorgias() {
    window?.GorgiasChat.open();
  }
  return (
    <div className="border rounded-2xl p-6 mt-22 mb-6">
      <div className="flex flex-row gap-x-6">
        <div
          className="h-20 w-20 shrink-0 rounded-full bg-gray-300 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${ImagePerson})` }}
        />
        <div>
          <Text className="block !font-bold" size="lead">
            We&apos;re Here to Help
          </Text>
          <Text className="text-sm lg:text-base block">
            Have a question or need assistance? Reach out to our friendly team
            and we&apos;ll get that squared away!
          </Text>
          <button
            onClick={OpenGorgias}
            className="border border-brand font-semibold rounded-[80px] text-brand py-2 px-4 mt-3 text-sm flex items-center gap-x-1"
          >
            <IconLiveChat />
            Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({ options, label, required, name }) {
  const [value, setValue] = useState('Select');

  return (
    <Listbox value={value} onChange={setValue} name={name}>
      {({ open }) => (
        <div className="relative flex-1">
          <Listbox.Label className="text-sm text-neutral-8">
            {label} {required && <span className="text-error">*</span>}
          </Listbox.Label>
          <Listbox.Button className="flex justify-between items-center w-full rounded border-neutral-80 border p-3 focus:border-brand focus:ring-0 invalid:border-error invalid:ring-0 bg-white">
            <Text>{value}</Text>
            <IconCaret
              direction={open ? 'up' : 'down'}
              className="block"
              height="28px"
              width="28px"
            />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 bg-white border border-neutral-80 right-0 max-h-48 overflow-auto w-full rounded flex flex-col divide-y mt-2">
            {options.map((option) => (
              <Listbox.Option key={option} value={option}>
                {({ active, selected }) => (
                  <div
                    className={clsx(
                      selected && 'font-extrabold ',
                      active && 'bg-brand/30',
                      'p-3 cursor-pointer',
                    )}
                  >
                    {option}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  );
}
