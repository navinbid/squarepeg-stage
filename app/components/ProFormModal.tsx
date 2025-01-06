import React from 'react';
import ProForm from './ProForm';

function ProFormModal({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 overflow-y-auto z-30">
          <div className="flex bg-black bg-opacity-70 items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div> */}

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom text-black bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
              <ProForm onClose={onClose} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProFormModal;