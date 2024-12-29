'use client';

import LogoutButton from '@/components/custom/LogoutButton';
import { useAuthStore } from '@/store/authStore';
import {
  GetCustomerAndUserProfileData,
  GetCustomerAndUserProfileVars,
  GetAddressesData,
  Address,
} from '@/types/graphql';
import {
  GET_CURRENT_USER_AND_USER_PROFILE,
  GET_ADDRESSES,
} from '@/graphql/queries';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  CheckCircle,
  CircleUserRound,
  UserCog,
  Loader2,
  Plus,
} from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { Skeleton } from '@/components/ui/skeleton'; // Adjust the import path based on your project structure
import { Button } from '@/components/ui/button'; // Assuming you have a Button component from shadcn
import { toast } from 'sonner';
import AddressList from '@/components/custom/AddressList';
import AddressDialog from '@/components/custom/AddressDialog';
import ConfirmDeleteDialog from '@/components/custom/ConfirmDeleteDialog';
import { ADDRESS_MUTATION, DELETE_ADDRESS, SEND_EMAIL_VERIFICATION, UPDATE_ADDRESS } from '@/graphql/mutation';

const AccountPage: React.FC = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // State for Address Dialogs
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Fetch User Profile
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery<GetCustomerAndUserProfileData, GetCustomerAndUserProfileVars>(
    GET_CURRENT_USER_AND_USER_PROFILE,
    {
      skip: !token, // Skip the query if not authenticated
      fetchPolicy: 'network-only', // Ensure fresh data
    }
  );

  // Fetch Addresses
  const {
    data: addressesData,
    loading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery<GetAddressesData>(GET_ADDRESSES, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  // Send Email Verification Mutation
  const [sendEmailVerification, { loading: verifyLoading }] = useMutation(
    SEND_EMAIL_VERIFICATION,
    {
      onCompleted: () => {
        toast.success('Verification email sent. Please check your inbox.');
        setTimeout(() => {
          refetchUser();
        }, 3000); // Wait for 3 seconds before refetching
      },
      onError: () => {
        toast.error('Failed to send verification email.');
      },
    }
  );

  const handleVerifyEmail = () => {
    sendEmailVerification();
  };

  // Register Address Mutation
  const [registerAddress, { loading: registerLoading }] = useMutation(
    ADDRESS_MUTATION,
    {
      onCompleted: () => {
        toast.success('Address added successfully.');
        setIsAddressDialogOpen(false);
        refetchAddresses();
      },
      onError: () => {
        toast.error('Failed to add address.');
      },
    }
  );

  // Update Address Mutation
  const [updateAddress, { loading: updateLoading }] = useMutation(
    UPDATE_ADDRESS,
    {
      onCompleted: () => {
        toast.success('Address updated successfully.');
        setIsAddressDialogOpen(false);
        refetchAddresses();
      },
      onError: () => {
        toast.error('Failed to update address.');
      },
    }
  );

  // Delete Address Mutation
  const [deleteAddress, { loading: deleteLoading }] = useMutation(
    DELETE_ADDRESS,
    {
      onCompleted: () => {
        toast.success('Address deleted successfully.');
        setIsDeleteDialogOpen(false);
        refetchAddresses();
      },
      onError: (error) => {
        toast.error('Failed to delete address. Reason: ' + error.message);
      },
    }
  );

  const handleAddAddress = () => {
    setAddressToEdit(null);
    setIsAddressDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address);
    setIsAddressDialogOpen(true);
  };

  const handleDeleteAddress = (addressId: number) => {
    setAddressToDelete(addressId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAddress = () => {
    if (addressToDelete !== null) {
      deleteAddress({
        variables: { addressId: addressToDelete },
      });
    }
  };

  const handleAddressFormSubmit = (formData: {
    addressType: string;
    city: string;
    country: string;
    isDefault: boolean;
    postalCode: string;
    state: string;
    streetAddress: string;
    addressId?: number;
    addressTypeId?: number;
  }) => {
    if (addressToEdit) {
      // Update Address
      updateAddress({
        variables: {
          addressType: formData.addressType,
          city: formData.city,
          country: formData.country,
          customerId: userData?.customerProfile.customerId || 0,
          isDefault: formData.isDefault,
          postalCode: formData.postalCode,
          state: formData.state,
          streetAddress: formData.streetAddress,
          addressId: addressToEdit.addressId,
          addressTypeId: addressToEdit.addressTypeId,
        },
      });
    } else {
      // Add Address
      registerAddress({
        variables: {
          addressType: formData.addressType,
          city: formData.city,
          country: formData.country,
          customerId: userData?.customerProfile.customerId || 0,
          isDefault: formData.isDefault,
          postalCode: formData.postalCode,
          state: formData.state,
          streetAddress: formData.streetAddress,
        },
      });
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  if (userLoading || addressesLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="size-10 animate-spin text-indigo-600" />
        <span className="mt-4 text-xl text-gray-700">Loading...</span>
      </div>
    );
  }

  if (userError || addressesError) {
    toast.error('Error loading account data. Please try again later.');
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Error loading account data. Please try again later.</p>
      </div>
    );
  }

  if (!userData || !userData.customerProfile || !userData.getUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-700">No account data found.</p>
      </div>
    );
  }

  const { customerProfile, getUser } = userData;
  const addresses = addressesData?.addresses || [];

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="flex flex-col md:flex-row">
          {/* Profile Section */}
          <div className="flex flex-col items-center justify-center bg-indigo-600 p-6 md:w-1/3">
            {getUser.emailVerified ? (
              <CheckCircle className="mb-4 text-6xl text-white" />
            ) : (
              <User className="mb-4 text-6xl text-white" />
            )}
            {/* Replace the src with user's profile picture if available */}
            <CldImage
              src={getUser.emailVerified ? 'default_verified_avatar.jpg' : 'default_avatar.jpg'}
              alt={`${customerProfile.firstName} ${customerProfile.lastName}`}
              width={150}
              height={150}
              className="rounded-full object-cover"
            />
            <h2 className="mt-4 text-2xl font-semibold text-white">
              {customerProfile.firstName} {customerProfile.lastName}
            </h2>
            <p className="mt-2 text-indigo-200">{getUser.role.toUpperCase()}</p>
            {!getUser.emailVerified && (
              <Button
                variant="secondary"
                onClick={handleVerifyEmail}
                disabled={verifyLoading}
                className="mt-4 flex items-center space-x-2"
              >
                {verifyLoading && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                <span>Verify Email</span>
              </Button>
            )}
          </div>

          {/* Account Details and Addresses Section */}
          <div className="p-6 md:w-2/3">
            {/* Account Details */}
            <h3 className="mb-6 text-xl font-semibold">Account Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Customer ID */}
              <div className="flex items-center">
                <UserCog className="mr-3 size-6 text-indigo-500" />
                <div>
                  <h4 className="text-gray-600">Customer ID</h4>
                  <p className="text-gray-800">{customerProfile.customerId}</p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center">
                <CircleUserRound className="mr-3 size-6 text-indigo-500" />
                <div>
                  <h4 className="text-gray-600">User ID</h4>
                  <p className="text-gray-800">{customerProfile.userId}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center">
                <Mail className="mr-3 size-6 text-indigo-500" />
                <div className="flex w-full items-center justify-between">
                  <div>
                    <h4 className="text-gray-600">Email</h4>
                    <p className="text-gray-800">{getUser.email}</p>
                  </div>
                  {!getUser.emailVerified && (
                    <Button
                      variant="outline"
                      onClick={handleVerifyEmail}
                      disabled={verifyLoading}
                      className="flex items-center space-x-2"
                    >
                      {verifyLoading && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      <span>Verify</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center">
                <CircleUserRound className="mr-3 size-6 text-indigo-500" />
                <div>
                  <h4 className="text-gray-600">Role</h4>
                  <p className="text-gray-800">{getUser.role}</p>
                </div>
              </div>

              {/* Registration Date */}
              <div className="flex items-center">
                <Calendar className="mr-3 size-6 text-indigo-500" />
                <div>
                  <h4 className="text-gray-600">Registration Date</h4>
                  <p className="text-gray-800">
                    {new Date(customerProfile.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Account Created At */}
              <div className="flex items-center">
                <Calendar className="mr-3 size-6 text-indigo-500" />
                <div>
                  <h4 className="text-gray-600">Account Created At</h4>
                  <p className="text-gray-800">
                    {new Date(getUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Email Verified */}
              <div className="flex items-center">
                <CheckCircle className="mr-3 size-6 text-indigo-500" />
                <div>
                  <h4 className="text-gray-600">Email Verified</h4>
                  <p
                    className={`text-gray-800 ${getUser.emailVerified ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {getUser.emailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Your Addresses</h3>
                <Button
                  variant="default"
                  onClick={handleAddAddress}
                  className="flex items-center space-x-2"
                >
                  <Plus className="size-4" />
                  <span>Add Address</span>
                </Button>
              </div>

              {/* Address List */}
              {addresses.length > 0 ? (
                <AddressList
                  addresses={addresses}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              ) : (
                <p className="text-gray-700">No addresses found.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              {/* Edit Profile Button */}
              <Button
                variant="outline"
                onClick={() => router.push('/account/edit')}
                className="flex items-center space-x-2"
              >
                <UserCog className="size-5" />
                <span>Edit Profile</span>
              </Button>

              {/* Logout Button */}
              <LogoutButton />
            </div>
          </div>

          {/* Address Dialog for Add/Edit */}
          <AddressDialog
            isOpen={isAddressDialogOpen}
            onClose={() => setIsAddressDialogOpen(false)}
            onSubmit={handleAddressFormSubmit}
            initialData={addressToEdit || undefined}
            loading={registerLoading || updateLoading}
          />

          {/* Confirm Delete Dialog */}
          <ConfirmDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDeleteAddress}
            addressType={
              addresses.find((addr) => addr.addressId === addressToDelete)?.addressType ||
              ''
            }
            loading={deleteLoading}
          />
        </div>
      </div>
    </div>

  );
};

export default AccountPage;