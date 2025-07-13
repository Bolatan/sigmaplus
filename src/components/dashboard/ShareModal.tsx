import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareByEmail: (email: string) => void;
  onShareByLink: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShareByEmail,
  onShareByLink,
}) => {
  const [email, setEmail] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleEmailShare = () => {
    onShareByEmail(email);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Share Dashboard</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Share this dashboard with others via email or a shareable link.
            </p>
            <div className="mt-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
              <button
                onClick={handleEmailShare}
                className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Share via Email
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={onShareByLink}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Copy Shareable Link
              </button>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
