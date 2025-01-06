import { Link } from '@remix-run/react';
import React from 'react';

const ProBanifitPending = () => {
  return (
    <>
      <div className="w-full sm:w-[calc(100%_-_270px)] sm:pt-24 bg-neutral-98">
        <div className="pt-14 pb-8 sm:pb-0 sm:pt-0 sm:pl-32">
          <div className="flex justify-start items-center">
            <h1 className="font-extrabold mr-4 text-[28px] sm:text-4xl text-neutral-8 sm:mr-7">
              Pro Benefits
            </h1>
            <div className="border border-neutral-72 rounded-3xl px-5 py-1.5 text-base text-black font-bold flex justify-start items-center">
              <span className="mr-2.5">Pending</span>
              <svg
                width="8"
                height="8"
                className="bg-[#FAA614] rounded-full"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
            </div>
          </div>
          <div className='py-4'>
            <h3 className='font-extrabold text-base sm:text-lg py-4'>Thank you for applying for our Pro Membership! </h3>
            <p className="text-base sm:text-lg text-neutral-8 py-4">
              Your application has been received and is currently under review by our team. We appreciate your interest in becoming a Pro Member. Please allow 3-5 business days for the review process.
            </p>
            <p className="text-base sm:text-lg text-neutral-8 py-4">
              Once your application is processed, you'll be notified via email about your Pro Membership status. If you have any questions or need further assistance, feel free to reach out to our  <span className=" text-green-30 underline cursor-pointer"> <Link to="/contact">support team</Link>
              </span>.
            </p>
            <p className="text-base sm:text-lg text-neutral-8 py-4">
              Thank you for choosing SquarePeg! We'll be in touch soon with updates regarding your application.
            </p>
          </div>
          <div className="flex justify-start items-center">
            {/* <ProFormModal isOpen={isFormModalOpen} onClose={handleCloseModal} /> */}
            <button className="sm-max:mb-10 text-base inline-block text-center pt-3 pb-0.5 font-extrabold transition-colors text-green-30 w-auto mt-1 border-b-2 border-[#b1bbad]">
              <Link to="/pro">Explore Benefits</Link>
            </button>
          </div>
          <div className="px-4 py-2 sm:mt-60 sm:mb-16 w-full bg-neutral-96 rounded-md sm:px-2 sm:py-1.5 text-center font-normal text-sm text-neutral-8">
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

export default ProBanifitPending;
