
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select'; // If needed in future enhancements
import { useQuery } from '@apollo/client';
import { GET_ADDRESS_TYPE } from '@/graphql/queries';
import { GetAddressTypeData, GetAddressTypeVars } from '@/types/graphql';
import { Loader2 } from 'lucide-react';

interface AddressFormProps {
  initialData?: {
    addressId: number;
    addressTypeId: number;
    addressType: string;
    city: string;
    country: string;
    isDefault: boolean;
    postalCode: string;
    state: string;
    streetAddress: string;
  };
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
  loading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    addressType: initialData?.addressType || '',
    city: initialData?.city || '',
    country: initialData?.country || '',
    isDefault: initialData?.isDefault || false,
    postalCode: initialData?.postalCode || '',
    state: initialData?.state || '',
    streetAddress: initialData?.streetAddress || '',
  });

  // If you plan to use address types as select options in the future
  const { data, loading: addressTypeLoading, error } = useQuery<
    GetAddressTypeData,
    GetAddressTypeVars
  >(GET_ADDRESS_TYPE, {
    variables: { addressTypeId: initialData?.addressTypeId || 1 }, // Default addressTypeId
    skip: !initialData, // Fetch only if updating
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        addressType: initialData.addressType,
        city: initialData.city,
        country: initialData.country,
        isDefault: initialData.isDefault,
        postalCode: initialData.postalCode,
        state: initialData.state,
        streetAddress: initialData.streetAddress,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, type } = target;

    let value: string | boolean;

    if (type === 'checkbox') {
      // Type assertion ensures that 'checked' exists
      value = (target as HTMLInputElement).checked;
    } else {
      value = target.value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Address Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address Type
        </label>
        <Input
          type="text"
          name="addressType"
          value={formData.addressType}
          onChange={handleChange}
          required
          placeholder="Home, Work, etc."
        />
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Street Address
        </label>
        <Input
          type="text"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          required
          placeholder="1234 Main St"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          City
        </label>
        <Input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Anytown"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          State
        </label>
        <Input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          placeholder="State"
        />
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Postal Code
        </label>
        <Input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
          placeholder="12345"
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <Input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          placeholder="Country"
        />
      </div>

      {/* Is Default */}
      <div className="flex items-center">
        <input
          id="isDefault"
          name="isDefault"
          type="checkbox"
          checked={formData.isDefault}
          onChange={handleChange}
          className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
          Set as Default Address
        </label>
      </div>

      {/* Submit Button */}
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Address'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;