'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { GET_ORDERS } from '@/graphql/queries';
import { GET_ORDER_ITEMS } from '@/graphql/queries';
import { REGISTER_REVIEW } from '@/graphql/mutation'; 
import { CldImage } from 'next-cloudinary';
// Adjust the import paths for your queries/mutations as necessary

interface Order {
  orderId: number;
  customerId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddressId: number;
  paymentMethodId: number;
  discountId?: number;
}

interface OrderItem {
  productId: number;
  name: string;
  description?: string;
  basePrice: string;
  categoryId: number;
  supplierId: number;
  stockQuantity: number;
  mediaPaths: string[];
  baseProductId: number;
}

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  
  // Ensure only logged-in customers can access
  useEffect(() => {
    if (!token || role?.toLowerCase() !== 'customer') {
      router.push('/login');
    }
  }, [token, role, router]);

  // State to store order items for each order
  const [ordersWithItems, setOrdersWithItems] = useState<{ [orderId: number]: OrderItem[] }>({});
  
  // State for review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentProductForReview, setCurrentProductForReview] = useState<OrderItem | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);

  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery<{ orders: Order[] }>(GET_ORDERS, {
    fetchPolicy: 'network-only',
  });

  const client = useApolloClient();

  // Once we have orders, fetch items for each order
  useEffect(() => {
    if (ordersData?.orders) {
      (async () => {
        const newOrdersWithItems: { [orderId: number]: OrderItem[] } = {};
        for (const order of ordersData.orders) {
          try {
            const { data } = await client.query<{ orderItems: OrderItem[] }>({
              query: GET_ORDER_ITEMS,
              variables: { orderId: order.orderId },
              fetchPolicy: 'network-only',
            });
            newOrdersWithItems[order.orderId] = data.orderItems;
          } catch (err) {
            console.error(`Error fetching order items for order ${order.orderId}:`, err);
            newOrdersWithItems[order.orderId] = [];
          }
        }
        setOrdersWithItems(newOrdersWithItems);
      })();
    }
  }, [ordersData, client]);

  const [registerReview, { loading: reviewLoading, error: reviewError }] = useMutation(REGISTER_REVIEW, {
    onCompleted: () => {
      setReviewDialogOpen(false);
      setCurrentProductForReview(null);
      setReviewText('');
      setRating(5);
    },
    onError: (err) => {
      console.error('Review Error:', err);
    }
  });

  const handleOpenReviewDialog = (product: OrderItem) => {
    setCurrentProductForReview(product);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentProductForReview) return;
    await registerReview({
      variables: {
        productId: currentProductForReview.productId,
        rating,
        reviewText,
        reviewDate: new Date().toISOString(),
        mediaPaths: [] // Add image upload logic if needed
      }
    });
  };

  if (ordersLoading) return <p>Loading orders...</p>;
  if (ordersError) return <p>Error loading orders: {ordersError.message}</p>;

  const orders = ordersData?.orders || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.orderId} className="border p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">Order #{order.orderId}</h2>
              <p>Date: {new Date(order.orderDate).toLocaleString()}</p>
              <p>Status: {order.status}</p>
              <p>Total Amount: €{order.totalAmount.toFixed(2)}</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Purchased Products:</h3>
              {ordersWithItems[order.orderId]?.length > 0 ? (
                <ul className="space-y-2">
                  {ordersWithItems[order.orderId].map((item) => (
                    <li key={item.productId} className="flex items-center justify-between border p-2 rounded">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p>Price: {item.basePrice} €</p>
                        {item.mediaPaths && item.mediaPaths.length > 0 && (<CldImage
                            src={item.mediaPaths[0]}
                            width="100"
                            height="100"
                            crop={{ type: 'fill' }}
                            alt="Uploaded image preview"
                          />)}
                      </div>
                      <Button onClick={() => handleOpenReviewDialog(item)}>
                        Review Product
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Loading order items...</p>
              )}
            </div>
          ))}
        </div>
      )}

      {reviewDialogOpen && currentProductForReview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md bg-white rounded p-4">
            <h2 className="text-2xl font-semibold mb-4">Review {currentProductForReview.name}</h2>
            {reviewError && <p className="text-red-500 mb-2">Error: {reviewError.message}</p>}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Rating (1-5):</label>
              <input
                type="number"
                value={rating}
                min={1}
                max={5}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border rounded p-1 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Review Text:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="border rounded p-1 w-full"
                rows={4}
              />
            </div>
            <div className="flex space-x-4 justify-end">
              <Button variant="secondary" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitReview} disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
