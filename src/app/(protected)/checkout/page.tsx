'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import GraphQL queries and mutations
import { GET_ADDRESSES } from '@/graphql/queries';
import { RegisterOrderVariables, REGISTER_ORDER, REGISTER_PAYMENT_METHOD } from '@/graphql/mutation';

// Define TypeScript interfaces
interface PaymentMethod {
  paymentMethodId: number;
  customerId: number;
  paymentType: 'card' | 'upi' | 'iban' | 'netbanking';
  isDefault: boolean;
  bankName?: string;
  accountHolderName?: string;
  cardNumber?: string;
  cardExpirationDate?: string; // ISO Date string
  iban?: string;
  upiId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  cardTypeId?: number;
}

interface Address {
  addressId: number;
  addressTypeId: number;
  addressType: string;
  city: string;
  country: string;
  isDefault: boolean;
  postalCode: string;
  state: string;
  streetAddress: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [isAddingNewPayment, setIsAddingNewPayment] = useState<boolean>(false);
  const [newPaymentType, setNewPaymentType] = useState<'card' | 'upi' | 'iban' | 'netbanking' | ''>('');
  const [newPaymentDetails, setNewPaymentDetails] = useState<any>({});

  useEffect(() => {
    // Redirect to login if not authenticated or not a customer
    if (!token || role?.toLowerCase() !== 'customer') {
      router.push('/login');
    }
  }, [token, role, router]);

  // Fetch customer addresses
  const { data: addressesData, loading: addressesLoading, error: addressesError } = useQuery<{ addresses: Address[] }, {}>(GET_ADDRESSES, {
    fetchPolicy: 'network-only',
    skip: !token,
  });

  // Mutation to register the order
  const [registerOrder, { loading: orderLoading }] = useMutation<{ registerOrder: { orderId: number } }, RegisterOrderVariables>(REGISTER_ORDER, {
    onCompleted: () => {
      // Once the order is placed, clear the cart and navigate to '/orders'
      clearCart();
      router.push('/orders');
    },
    onError: (err) => {
      console.error('Order Error:', err);
      toast.error(`Order failed: ${err.message}`);
    },
  });

  // Mutation to register a new payment method
  const [registerPaymentMethod, { loading: paymentMethodLoading }] = useMutation<{ registerPaymentMethod: PaymentMethod }, any>(REGISTER_PAYMENT_METHOD, {
    onCompleted: (data) => {
      toast.success('Payment method added successfully.');
      // Automatically select the newly added payment method
      setSelectedPaymentMethodId(data.registerPaymentMethod.paymentMethodId);
      setIsAddingNewPayment(false);
      setNewPaymentType('');
      setNewPaymentDetails({});
    },
    onError: (err) => {
      console.error('Register Payment Method Error:', err);
      toast.error(`Failed to add payment method: ${err.message}`);
    },
  });

  // Compute total price from the cart
  const totalPrice = cartItems.reduce((sum, item) => {
    const priceStr = item.price.replace('€', '').trim();
    const price = parseFloat(priceStr) || 0;
    return sum + price * item.quantity;
  }, 0);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address before placing order.');
      return;
    }
    if (!isAddingNewPayment && !selectedPaymentMethodId) {
      toast.error('Please select a payment method before placing order.');
      return;
    }
    // Directly place the order
    handleOrderSubmission();
  };

  const handleOrderSubmission = async () => {
    let paymentMethodId: number | null = selectedPaymentMethodId;

    // If adding a new payment method, register it first
    if (isAddingNewPayment && newPaymentType) {
      try {
        const { data } = await registerPaymentMethod({
          variables: {
            paymentType: newPaymentType,
            isDefault: newPaymentDetails.isDefault || false, // Use the value from state
            ...newPaymentDetails,
          },
        });
        paymentMethodId = data?.registerPaymentMethod?.paymentMethodId || null;
      } catch (error) {
        // Error is handled in onError
        return;
      }
    }

    if (!paymentMethodId) {
      toast.error('Failed to obtain payment method ID.');
      return;
    }

    // Proceed to register the order
    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    const variables: RegisterOrderVariables = {
      input: {
        shippingAddressId: selectedAddressId!,
        paymentMethodId: paymentMethodId!,
        discountCode: discountCode || undefined,
        orderItems,
      },
    };

    try {
      await registerOrder({ variables });
    } catch (error) {
      // Error is handled in onError
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (addressesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-10 animate-spin text-indigo-600" />
        <span className="ml-2 text-xl text-gray-700">Loading...</span>
      </div>
    );
  }

  if (addressesError) {
    toast.error('Error loading account data. Please try again later.');
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Error loading account data. Please try again later.</p>
      </div>
    );
  }

  const addresses = addressesData?.addresses || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Checkout</h1>

      {/* Address Selection */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Select Shipping Address</h2>
        {addresses.length === 0 ? (
          <p>You have no saved addresses. Please add one in your account.</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((addr: Address) => (
              <label key={addr.addressId} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="address"
                  value={addr.addressId}
                  onChange={() => setSelectedAddressId(addr.addressId)}
                  checked={selectedAddressId === addr.addressId}
                  className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{`${addr.streetAddress}, ${addr.city}, ${addr.postalCode}, ${addr.country}`}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Select Payment Method</h2>
        <div className="space-y-4">
          {/* Payment Type Selection */}
          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">Payment Type</Label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="card"
                  checked={newPaymentType === 'card'}
                  onChange={() => {
                    setNewPaymentType('card');
                    setIsAddingNewPayment(true);
                    setNewPaymentDetails({});
                    setSelectedPaymentMethodId(null);
                  }}
                  className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Card</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="upi"
                  checked={newPaymentType === 'upi'}
                  onChange={() => {
                    setNewPaymentType('upi');
                    setIsAddingNewPayment(true);
                    setNewPaymentDetails({});
                    setSelectedPaymentMethodId(null);
                  }}
                  className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>UPI</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="iban"
                  checked={newPaymentType === 'iban'}
                  onChange={() => {
                    setNewPaymentType('iban');
                    setIsAddingNewPayment(true);
                    setNewPaymentDetails({});
                    setSelectedPaymentMethodId(null);
                  }}
                  className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>IBAN</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="netbanking"
                  checked={newPaymentType === 'netbanking'}
                  onChange={() => {
                    setNewPaymentType('netbanking');
                    setIsAddingNewPayment(true);
                    setNewPaymentDetails({});
                    setSelectedPaymentMethodId(null);
                  }}
                  className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Net Banking</span>
              </label>
            </div>
          </div>

          {/* Payment Details Form */}
          {isAddingNewPayment && newPaymentType && (
            <div className="rounded-md border bg-gray-50 p-4">
              <h3 className="mb-2 text-xl font-semibold">Enter Payment Details</h3>
              <div className="space-y-4">
                {/* Conditional Input Fields Based on Payment Type */}
                {newPaymentType === 'card' && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Card Number
                      </Label>
                      <Input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        onChange={(e) =>
                          setNewPaymentDetails((prev: any) => ({
                            ...prev,
                            cardNumber: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardExpirationDate" className="block text-sm font-medium text-gray-700">
                        Expiration Date
                      </Label>
                      <Input
                        type="month"
                        id="cardExpirationDate"
                        name="cardExpirationDate"
                        onChange={(e) =>
                          setNewPaymentDetails((prev: any) => ({
                            ...prev,
                            cardExpirationDate: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardTypeName" className="block text-sm font-medium text-gray-700">
                        Card Type
                      </Label>
                      <Input
                        type="text"
                        id="cardTypeName"
                        name="cardTypeName"
                        placeholder="e.g., Visa, MasterCard"
                        onChange={(e) =>
                          setNewPaymentDetails((prev: any) => ({
                            ...prev,
                            cardTypeName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </>
                )}

                {newPaymentType === 'upi' && (
                  <div>
                    <Label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
                      UPI ID
                    </Label>
                    <Input
                      type="text"
                      id="upiId"
                      name="upiId"
                      placeholder="user@bank"
                      onChange={(e) =>
                        setNewPaymentDetails((prev: any) => ({
                          ...prev,
                          upiId: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                )}

                {newPaymentType === 'iban' && (
                  <div>
                    <Label htmlFor="iban" className="block text-sm font-medium text-gray-700">
                      IBAN
                    </Label>
                    <Input
                      type="text"
                      id="iban"
                      name="iban"
                      placeholder="DE89 3704 0044 0532 0130 00"
                      onChange={(e) =>
                        setNewPaymentDetails((prev: any) => ({
                          ...prev,
                          iban: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                )}

                {newPaymentType === 'netbanking' && (
                  <>
                    <div>
                      <Label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                        Bank Name
                      </Label>
                      <Input
                        type="text"
                        id="bankName"
                        name="bankName"
                        placeholder="Bank Name"
                        onChange={(e) =>
                          setNewPaymentDetails((prev: any) => ({
                            ...prev,
                            bankName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">
                        IFSC Code
                      </Label>
                      <Input
                        type="text"
                        id="ifscCode"
                        name="ifscCode"
                        placeholder="IFSC Code"
                        onChange={(e) =>
                          setNewPaymentDetails((prev: any) => ({
                            ...prev,
                            ifscCode: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </>
                )}

                {/* Optional: Set as Default */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newPaymentDetails.isDefault || false}
                    onChange={(e) =>
                      setNewPaymentDetails((prev: any) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                    className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="isDefault" className="ml-2">
                    Set as Default Payment Method
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleOrderSubmission}
                  disabled={paymentMethodLoading}
                  className="flex items-center space-x-2"
                >
                  {paymentMethodLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Adding Payment Method...</span>
                    </>
                  ) : (
                    'Add Payment Method and Place Order'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discount Code */}
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Discount Code</h2>
        <Input
          type="text"
          className="mr-2 w-full sm:w-1/2"
          placeholder="Enter discount code"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </div>

      {/* Order Summary */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Order Summary</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left">Product</th>
                <th className="border-b px-4 py-2 text-left">Quantity</th>
                <th className="border-b px-4 py-2 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td className="border-b px-4 py-2">{item.name}</td>
                  <td className="border-b px-4 py-2">{item.quantity}</td>
                  <td className="border-b px-4 py-2">{item.price}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2 font-semibold" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-2 font-semibold">{totalPrice.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Place Order Button */}
      <div className="text-right">
        <Button
          onClick={handlePlaceOrder}
          disabled={
            orderLoading ||
            cartItems.length === 0 ||
            (isAddingNewPayment && !newPaymentType)
          }
          className="flex items-center space-x-2"
        >
          {orderLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;