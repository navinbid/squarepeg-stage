import { Form, Link } from '@remix-run/react';
import React, { useState } from 'react';
import { usePrefixPathWithLocale } from '~/lib/utils';

interface AccountSideBarProps {
  activeNav: any; // Replace 'any' with the appropriate type
}

const AccountSideBar: React.FC<AccountSideBarProps> = ({ activeNav }) => {
  const [showShidebar, setshowShidebar] = useState(false);

  return (
    <>
      <div className="w-[calc(100%_+_20px)] sm:w-[270px] sm:pt-24 sm:pr-7 bg-white commonrightbg sm:pb-14">
        <div className='py-16 sm:py-0'>
          {/* my account start */}
          <div className="flex justify-start items-center pb-10">
            <div className=" w-16 h-16 rounded-full bg-neutral-92 flex justify-center items-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.4013 21.4994C6.8013 20.6105 8.18464 19.9382 9.5513 19.4827C10.918 19.0271 12.4013 18.7993 14.0013 18.7993C15.6013 18.7993 17.0902 19.0271 18.468 19.4827C19.8457 19.9382 21.2346 20.6105 22.6346 21.4994C23.6124 20.2993 24.3069 19.0882 24.718 17.866C25.1291 16.6438 25.3346 15.3549 25.3346 13.9993C25.3346 10.7771 24.2513 8.08268 22.0846 5.91602C19.918 3.74935 17.2235 2.66602 14.0013 2.66602C10.7791 2.66602 8.08464 3.74935 5.91797 5.91602C3.7513 8.08268 2.66797 10.7771 2.66797 13.9993C2.66797 15.3549 2.87908 16.6438 3.3013 17.866C3.72352 19.0882 4.42352 20.2993 5.4013 21.4994ZM13.9951 14.9993C12.7103 14.9993 11.6291 14.5584 10.7513 13.6765C9.87352 12.7946 9.43464 11.7112 9.43464 10.4265C9.43464 9.14173 9.87559 8.06046 10.7575 7.18268C11.6394 6.3049 12.7227 5.86602 14.0075 5.86602C15.2923 5.86602 16.3735 6.30697 17.2513 7.18888C18.1291 8.07079 18.568 9.15413 18.568 10.4389C18.568 11.7236 18.127 12.8049 17.2451 13.6827C16.3632 14.5605 15.2799 14.9993 13.9951 14.9993ZM13.9878 27.3327C12.1401 27.3327 10.4037 26.9827 8.77864 26.2827C7.15355 25.5827 5.73994 24.6271 4.5378 23.416C3.33569 22.2049 2.39019 20.79 1.7013 19.1713C1.01241 17.5526 0.667969 15.8231 0.667969 13.9827C0.667969 12.1423 1.01797 10.4127 1.71797 8.79405C2.41797 7.17536 3.37352 5.76602 4.58464 4.56602C5.79575 3.36602 7.21065 2.41602 8.82934 1.71602C10.448 1.01602 12.1775 0.666016 14.018 0.666016C15.8584 0.666016 17.5879 1.01602 19.2066 1.71602C20.8253 2.41602 22.2346 3.36602 23.4346 4.56602C24.6346 5.76602 25.5846 7.17713 26.2846 8.79935C26.9846 10.4216 27.3346 12.1519 27.3346 13.9905C27.3346 15.829 26.9846 17.5568 26.2846 19.1738C25.5846 20.7908 24.6346 22.2049 23.4346 23.416C22.2346 24.6271 20.8221 25.5827 19.197 26.2827C17.5719 26.9827 15.8355 27.3327 13.9878 27.3327Z"
                  fill="#160E1B"
                />
              </svg>
            </div>
            <div className=" text-2xl text-black font-extrabold ml-4">
              My Account
            </div>
          </div>
          {/* my account end */}
          {/* Responsive menu start */}
          <div className='pt-8 sm:hidden'>
            <div className={`flex justify-between items-center bg-green-30 rounded-full w-[calc(100%_-_20px)] pl-8 pr-6 py-3 `} onClick={() => { setshowShidebar(true) }} >
              <span className='text-base font-extrabold text-white'>Menu</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.3332 5L7.1582 6.175L10.9749 10L7.1582 13.825L8.3332 15L13.3332 10L8.3332 5Z" fill="white" />
              </svg>
            </div>
          </div>
          {/* Responsive menu end */}
        </div>
        {/* side menu start */}
        <div className={`sm-max:fixed sm-max:w-full sm-max:top-0 sm-max:-right-full sm-max:bg-gray-900 sm-max:bg-opacity-25 sm-max:transition-all sm-max:duration-700 sm-max:h-full sm-max:z-50 sm:bg-white ${showShidebar ? 'sidemenuopen' : ''} `}>
          <div className='sm-max:bg-white sm-max:h-full sm-max:w-64 sm-max:pt-16 sm-max:px-5 sm-max:right-0 sm-max:absolute'>
            <div className="absolute right-5 top-4 cursor-pointer z-[60px] sm:hidden">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => { setshowShidebar(false) }} >
                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#160E1B" />
                <path d="M22.6673 10.5083L21.4923 9.33325L16.0007 14.8249L10.509 9.33325L9.33398 10.5083L14.8257 15.9999L9.33398 21.4916L10.509 22.6666L16.0007 17.1749L21.4923 22.6666L22.6673 21.4916L17.1757 15.9999L22.6673 10.5083Z" fill="#160E1B" />
              </svg>
            </div>
            <ul className=" space-y-2 mb-4 sidemenuactive">
              <li
                className={`font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold ${activeNav == 'profile' ? 'active' : ''
                  }`}
              >
                <Link to="/account">Profile</Link>
              </li>
              <li
                className={`font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold ${activeNav == 'shipping' ? 'active' : ''
                  }`}
              >
                <Link to="/account/shipping">Shipping</Link>
              </li>
              <li className={`font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold ${activeNav == 'password' ? 'active' : ''}`}>
                <Link to="/account/password">Passwords & Security</Link>
              </li>
              <li
                className={`font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold ${activeNav == 'probenefits' ? 'active' : ''
                  }`}
              >
                <Link to="/account/pro-benefits">Pro Benefits</Link>
              </li>
              {/* <li className="font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold ">
            Payments
          </li> */}
              <li className="font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold flex justify-start items-center">
                <Link to="/account/orders"><span className="mr-3">Orders</span></Link>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.47306 0.833984V2.11604H6.97947L0.832031 8.26347L1.73588 9.16732L7.88331 3.01988V8.52629H9.16537V0.833984H1.47306Z"
                    fill="#160E1B"
                  />
                </svg>

              </li>
              <li className="font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold flex justify-start items-center">
                <Link to="/account/saved-products"><span className="mr-3">Lists</span></Link>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.47306 0.833984V2.11604H6.97947L0.832031 8.26347L1.73588 9.16732L7.88331 3.01988V8.52629H9.16537V0.833984H1.47306Z"
                    fill="#160E1B"
                  />
                </svg>

              </li>
              {/* <li className="font-normal text-base text-neutral-8 border-l-2 border-white py-1.5 px-2.5 bg-white rounded-r-md cursor-pointer hover:border-green-30 hover:bg-neutral-96 hover:font-semibold flex justify-start items-center">
            <span className="mr-3">FAQs</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.47306 0.833984V2.11604H6.97947L0.832031 8.26347L1.73588 9.16732L7.88331 3.01988V8.52629H9.16537V0.833984H1.47306Z"
                fill="#160E1B"
              />
            </svg>
          </li> */}
            </ul>
            {/* side menu end */}
            <Form method="post" action={usePrefixPathWithLocale('/account/logout')}>
              <button className="sm-max:w-full border border-green-30 rounded-3xl px-5 py-1.5 text-base text-green-30 font-medium">
                Log Out
              </button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSideBar;
