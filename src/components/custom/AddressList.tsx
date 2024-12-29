import React from 'react';
import { Address } from '@/types/graphql';
import {
  Edit3,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (addressId: number) => void;
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.addressId}
          className="flex flex-col rounded-lg bg-gray-50 p-4 shadow"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-800">
              {address.addressType}
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(address)}
                className="flex items-center"
              >
                <Edit3 className="mr-1 size-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(address.addressId)}
                className="flex items-center"
              >
                <Trash2 className="mr-1 size-4" />
                Delete
              </Button>
            </div>
          </div>
          <p className="mt-2 text-gray-700">
            {address.streetAddress}, {address.city}, {address.state}, {address.country} - {address.postalCode}
          </p>
          {address.isDefault && (
            <span className="mt-2 inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              Default Address
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AddressList;