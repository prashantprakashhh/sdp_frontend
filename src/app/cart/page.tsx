'use client';

import React from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { toast } from 'sonner';

const CartPage: React.FC = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const handleClearCart = () => {
    clearCart();
    toast.info('Cart cleared.');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link href="/"><p className="text-indigo-600 hover:underline">Go shopping</p></Link>.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded border p-4">
                <div className="flex items-center space-x-4">
                  {item.image &&  <CldImage
                    src={item.image}
                    width={100}
                    height={100}
                    crop="fill"
                    alt={item.name}
                    className="rounded object-cover"
                  />}
                 
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-gray-700">{item.price} €</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Quantity: {item.quantity}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      removeFromCart(item.id);
                      toast.info(`Removed one ${item.name} from cart.`);
                    }}
                    aria-label={`Remove one ${item.name} from cart`}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xl font-semibold">Total: {getTotalPrice()} €</p>
            <div className="flex space-x-4">
              <Button variant="destructive" onClick={handleClearCart}>
                Clear Cart
              </Button>
              <Link href="/checkout">
              <Button variant="default">
                Proceed to Checkout
              </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;