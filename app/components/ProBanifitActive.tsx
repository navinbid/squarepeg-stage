import { Link } from '@remix-run/react';
import React from 'react';

const ProBanifitActive = () => {
  return (
    <>
      <div className="w-full sm:w-[calc(100%_-_270px)] sm:pt-24 bg-neutral-98">
        <div className="pt-14 pb-8 sm:pb-0 sm:pt-0 sm:pl-32">
          <div className="flex justify-start items-center">
            <h1 className="font-extrabold mr-4 text-[28px] sm:text-4xl text-neutral-8 sm:mr-7">
              Pro Benefits
            </h1>
            <div className="border border-neutral-72 rounded-3xl px-5 py-1.5 text-base text-black font-bold flex justify-start items-center">
              <span className="mr-2.5">Active</span>
              <svg
                width="8"
                height="8"
                className="bg-[#667425] rounded-full"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
            </div>
          </div>
          <p className="text-base pt-4 pb-8 sm:text-lg text-neutral-8 sm:py-6">
            You’re a Pro! Your benefits and special pricing will show while
            logged in and shopping. Having trouble with your account?{' '}
            <span className=" text-green-30 underline cursor-pointer">
              Contact us
            </span>{' '}
            with questions.
          </p>

          <div className="flex justify-start items-center">
            <button className="sm-max:mb-10 inline-block text-center pt-3 pb-0.5 font-extrabold transition-colors text-green-30 w-auto mt-1 border-b-2 border-[#b1bbad]">
              <Link to="/pro">Explore Benefits</Link>
            </button>
          </div>
          <div className=" px-4 py-2 sm:mt-60 sm:mb-16 w-full bg-neutral-96 rounded-md sm:px-2 sm:py-1.5 text-center font-normal text-sm text-neutral-8">
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

export default ProBanifitActive;
