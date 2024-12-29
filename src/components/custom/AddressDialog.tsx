import React from 'react'; // Adjust the import path based on your project structure
import AddressForm from './AddressForm';
import { Address } from '@/types/graphql';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface AddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    addressType: string;
    city: string;
    country: string;
    isDefault: boolean;
    postalCode: string;
    state: string;
    streetAddress: string;
    addressId?: number;
    addressTypeId?: number;
  }) => void;
  initialData?: Address;
  loading: boolean;
}

const AddressDialog: React.FC<AddressDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="mt-4">
          <AddressForm
            initialData={initialData}
            onSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;