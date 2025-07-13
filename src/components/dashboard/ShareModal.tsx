import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Dashboard">
      <div className="space-y-4">
        <p>Share this link with others to give them access to this dashboard.</p>
        <div className="flex items-center space-x-2">
          <Input value={shareUrl} readOnly />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
    </Modal>
  );
};
