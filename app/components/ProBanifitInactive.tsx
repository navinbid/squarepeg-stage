import React, { useEffect, useState } from 'react';
import ProFormModal from './ProFormModal';
import { Link, useSearchParams } from "@remix-run/react";
import Benefits1 from '~/assets/benefits1.png';
import Benefits2 from '~/assets/benefits2.png';
import Benefits3 from '~/assets/benefits3.png';
import Benefits4 from '~/assets/benefits4.png';
import Benefits5 from '~/assets/benefits5.png';


const ProBanifitInactive = () => {
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  const handleApplyNowClick = () => {
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const reg = searchParams.get('register');

  useEffect(() => {
    if (reg === 'true') {
      setFormModalOpen(true);
    }
  }, [reg]);

  return (
    <>
      <div className="w-full sm:w-[calc(100%_-_270px)] sm:pt-24 bg-neutral-98">
        <div className="pt-14 pb-8 sm:pb-0 sm:pt-0 sm:pl-32">
          <div className="flex justify-start items-center">
            <h1 className="font-extrabold mr-4 text-[28px] sm:text-4xl text-neutral-8 sm:mr-7">
              Pro Benefits
            </h1>
            <div className="border border-neutral-72 rounded-3xl px-5 py-1.5 text-base text-black font-bold flex justify-start items-center">
              <span className="mr-2.5">Inactive</span>
              <svg
                width="8"
                height="8"
                className="bg-[#B8B5BA] rounded-full"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
            </div>
          </div>
          <p className="text-base pt-4 pb-8 sm:text-lg text-neutral-8 sm:py-6">
            You are not currently part of our Pros program. Apply below to
            access special benefits and pricing.
          </p>
          <div className="bg-white rounded-3xl p-5 sm:rounded-2xl sm:px-9 sm:py-7 mb-8">
            <ul className="sm-max:pt-2 space-y-5 sm:pt-2 sm:mb-4">
              <li className="font-normal text-base text-neutral-8 sm:gap-4 sm-max:flex-col flex sm-max:justify-center sm-max:items-center sm:justify-start sm:items-start">
                <div className='sm:flex-shrink-0'>
                  <img
                    src={Benefits1}
                    className="w-9 h-9"
                    alt="Benefits1"
                  />
                </div>
                <div className='sm:flex-grow space-y-1.5 flex flex-col sm:justify-start sm-max:justify-center sm-max:items-center'>
                  <h2 className="sm-max:pt-5 sm-max:pb-2.5 text-[1.125rem] font-bold">
                    Fast Delivery
                  </h2>
                  <p className="text-[1rem] font-normal sm-max:text-center">
                    Get your products delivered swiftly with our efficient and reliable
                    shipping services.
                  </p>
                </div>
              </li>
              <li className="font-normal text-base text-neutral-8 sm:gap-4 sm-max:flex-col flex sm-max:justify-center sm-max:items-center sm:justify-start sm:items-start">
                <div className='sm:flex-shrink-0'>
                  <img
                    src={Benefits2}
                    className="w-9 h-9"
                    alt="Benefits2"
                  />
                </div>
                <div className='sm:flex-grow space-y-1.5 flex flex-col sm:justify-start sm-max:justify-center sm-max:items-center'>
                  <h2 className="sm-max:pt-5 sm-max:pb-2.5 text-[1.125rem] font-bold">
                    Lower Prices
                  </h2>
                  <p className="text-[1rem] font-normal sm-max:text-center">
                    Get cost-effective solutions without compromising quality and
                    competitive pricing.
                  </p>
                </div>
              </li>
              <li className="font-normal text-base text-neutral-8 sm:gap-4 sm-max:flex-col flex sm-max:justify-center sm-max:items-center sm:justify-start sm:items-start">
                <div className='sm:flex-shrink-0'>
                  <img
                    src={Benefits3}
                    className="w-9 h-9"
                    alt="Benefits3"
                  />
                </div>
                <div className='sm:flex-grow space-y-1.5 flex flex-col sm:justify-start sm-max:justify-center sm-max:items-center'>
                  <h2 className="sm-max:pt-5 sm-max:pb-2.5 text-[1.125rem] font-bold">
                    Easy Reorder & Returns
                  </h2>
                  <p className="text-[1rem] font-normal sm-max:text-center">
                    Streamline your ordering process and hassle-free returns for
                    ultimate convenience.
                  </p>
                </div>
              </li>
              <li className="font-normal text-base text-neutral-8 sm:gap-4 sm-max:flex-col flex sm-max:justify-center sm-max:items-center sm:justify-start sm:items-start">
                <div className='sm:flex-shrink-0'>
                  <img
                    src={Benefits4}
                    className="w-9 h-9"
                    alt="Benefits4"
                  />
                </div>
                <div className='sm:flex-grow space-y-1.5 flex flex-col sm:justify-start sm-max:justify-center sm-max:items-center'>
                  <h2 className="sm-max:pt-5 sm-max:pb-2.5 text-[1.125rem] font-bold">
                    Exclusive Gear
                  </h2>
                  <p className="text-[1rem] font-normal sm-max:text-center">
                    Discover a selection of exclusive gear that sets you apart from the
                    competition.
                  </p>
                </div>
              </li>
              <li className="font-normal text-base text-neutral-8 sm:gap-4 sm-max:flex-col flex sm-max:justify-center sm-max:items-center sm:justify-start sm:items-start">
                <div className='sm:flex-shrink-0'>
                  <img
                    src={Benefits5}
                    className="w-9 h-9"
                    alt="Benefits5"
                  />
                </div>
                <div className='sm:flex-grow space-y-1.5 flex flex-col sm:justify-start sm-max:justify-center sm-max:items-center'>
                  <h2 className="sm-max:pt-5 sm-max:pb-2.5 text-[1.125rem] font-bold">
                    Great Support
                  </h2>
                  <p className="text-[1rem] font-normal sm-max:text-center">
                    Experience exceptional support from our dedicated team, assisting
                    you every step.
                  </p>
                </div>
              </li>
            </ul>
            {/* <p className="text-base sm:text-lg text-neutral-8 sm:py-6">
              As a member you get rewarded with what you love for doing what you
              love. Sign up today<br className='hidden sm:block' /> and receive immediate access to these
              benefits:
            </p>
            <ul className="pt-6 space-y-4 sm:pt-0 sm:mb-4">
              <li className="font-normal text-base text-neutral-8 flex justify-start items-start">
                <svg
                  width="16"
                  height="16"
                  className="mt-1 sm:mt-1.5 w-4 h-4 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5ZM6.57544 11.7123L3.01294 8.14984L4.01756 7.14521L6.57544 9.69596L11.9833 4.28809L12.9879 5.29984L6.57544 11.7123Z"
                    fill="#160E1B"
                  />
                </svg>
                <p className="text-base sm:text-lg text-neutral-8 ml-2">Free shipping</p>
              </li>
              <li className="font-normal text-base text-neutral-8 flex justify-start items-start">
                <svg
                  width="16"
                  height="16"
                  className="mt-1 sm:mt-1.5 w-4 h-4 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5ZM6.57544 11.7123L3.01294 8.14984L4.01756 7.14521L6.57544 9.69596L11.9833 4.28809L12.9879 5.29984L6.57544 11.7123Z"
                    fill="#160E1B"
                  />
                </svg>
                <p className="text-base sm:text-lg text-neutral-8 ml-2">
                  15% off your next purchase
                </p>
              </li>
              <li className="font-normal text-base text-neutral-8 flex justify-start items-start">
                <svg
                  width="16"
                  height="16"
                  className="mt-1 sm:mt-1.5 w-4 h-4 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5ZM6.57544 11.7123L3.01294 8.14984L4.01756 7.14521L6.57544 9.69596L11.9833 4.28809L12.9879 5.29984L6.57544 11.7123Z"
                    fill="#160E1B"
                  />
                </svg>
                <p className="text-base sm:text-lg text-neutral-8 ml-2">
                  Access to Members Only products and sales
                </p>
              </li>
              <li className="font-normal text-base text-neutral-8 flex justify-start items-start">
                <svg
                  width="16"
                  height="16"
                  className="mt-1 sm:mt-1.5 w-4 h-4 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5ZM6.57544 11.7123L3.01294 8.14984L4.01756 7.14521L6.57544 9.69596L11.9833 4.28809L12.9879 5.29984L6.57544 11.7123Z"
                    fill="#160E1B"
                  />
                </svg>
                <p className="text-base sm:text-lg text-neutral-8 ml-2">
                  Special offers and promotions
                </p>
              </li>
            </ul> */}
          </div>

          <div className="pb-8 sm:pb-0 sm:flex sm:justify-start sm:items-center sm:space-x-3">
            <button
              className="block w-full sm:inline-block rounded-full text-center py-3 px-8 font-extrabold transition-colors bg-brand hover:bg-brand-hover text-white sm:w-auto mt-1"
              type="submit"
              onClick={handleApplyNowClick}
            >
              Apply Now
            </button>
            <ProFormModal isOpen={isFormModalOpen} onClose={handleCloseModal} />
            <div className='flex justify-center items-center'>
              <button className="block sm:inline-block text-center pt-3 pb-0.5 font-extrabold transition-colors text-green-30 sm:w-auto mt-1 border-b-2 border-[#b1bbad] cursor-pointer">
                <Link to="/pro">Learn More</Link>
              </button>
            </div>
          </div>
          <div className=" px-4 py-2 sm:mt-20 sm:mb-16 w-full bg-neutral-96 rounded-md sm:px-2 sm:py-1.5 text-center font-normal text-sm text-neutral-8">
            For more information about how we handle your data, please review
            our{' '}
            <span className=" text-green-30 underline cursor-pointer">
              <Link to="/privacy-policy">Privacy Policy</Link>
            </span>
            .
          </div>
        </div>
      </div>
    </>
  );
};

export default ProBanifitInactive;
