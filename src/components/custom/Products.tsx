// 'use client';

// import { useCartStore } from '@/store/cartStore';
// import { ShoppingCart, Plus, Minus } from 'lucide-react';
// import { CldImage } from 'next-cloudinary';
// import Link from 'next/link';
// import React from 'react';
// import { toast } from 'sonner';

// // Type definition matching your GraphQL schema for products
// type GraphQLProduct = {
//   productId: number;
//   name: string;
//   basePrice: string;
//   mediaPaths?: string[];
//   description?: string;
// };

// interface ProductsProps {
//   products: GraphQLProduct[];
// }

// const Products: React.FC<ProductsProps> = ({ products }) => {
//   // Access cart items and cart manipulation functions from Zustand store
//   const cartItems = useCartStore((state) => state.cartItems);
//   const addToCart = useCartStore((state) => state.addToCart);
//   const removeFromCart = useCartStore((state) => state.removeFromCart);
//   const increaseQuantity = useCartStore((state) => state.increaseQuantity);
//   const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

//   // Helper function to get cart item by productId
//   const getCartItem = (productId: number) => {
//     return cartItems.find((item) => item.id === productId);
//   };

//   return (
//     <section className="py-12">
//       <h2 className="mb-8 text-center text-3xl font-semibold">Products</h2>
//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//         {products.map((product) => {
//           const { productId, name, basePrice, mediaPaths } = product;
//           const cartItem = getCartItem(productId);
//           const quantity = cartItem?.quantity || 0;

//           return (
//             <div
//               key={productId}
//               className="flex size-52 flex-col rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
//             >
//               {/* Product Image */}
//               {mediaPaths && mediaPaths.length > 0 ? (
//                 <div className="mt-2 h-52 w-full">
//                   <CldImage
//                     src={mediaPaths[0]}
//                     width={300}
//                     height={300}
//                     crop="fill"
//                     alt={name}
//                     className="size-full rounded-md object-cover"
//                   />
//                 </div>
//               ) : (
//                 <div className="flex size-52 w-full items-center justify-center rounded-md bg-gray-300">
//                   <span>No Image</span>
//                 </div>
//               )}

//               {/* Product Name */}
//               <h3 className="mt-4 text-xl font-semibold">{name}</h3>

//               {/* Product Price */}
//               <p className="mt-2 text-gray-700">{basePrice} €</p>

//               {/* Action Buttons */}
//               <div className="mt-auto flex items-center justify-between">
//                 {/* View Details Button */}
//                 <Link href={`/product/${productId}`}>
//                   <p className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
//                     View Details
//                   </p>
//                 </Link>

//                 {/* Add to Cart or Quantity Controls */}
//                 {quantity === 0 ? (
//                   // Add to Cart Button
//                   <button
//                     onClick={() => {
//                       addToCart({
//                         id: productId,
//                         name,
//                         price: basePrice, // Store price as number
//                         image: mediaPaths && mediaPaths.length > 0 ? mediaPaths[0] : '',
//                       });
//                       toast.success(`${name} added to cart!`);
//                     }}
//                     className="ml-2 rounded bg-green-600 p-2 text-white transition-colors hover:bg-green-700"
//                     aria-label={`Add ${name} to cart`}
//                   >
//                     <ShoppingCart className="size-5" />
//                   </button>
//                 ) : (
//                   // Quantity Controls
//                   <div className="flex items-center space-x-2">
//                     {/* Decrease Quantity Button */}
//                     <button
//                       onClick={() => {
//                         decreaseQuantity(productId);
//                         toast.info(`One ${name} removed from cart.`);
//                       }}
//                       className="rounded bg-red-600 p-1 text-white transition-colors hover:bg-red-700"
//                       aria-label={`Remove one ${name} from cart`}
//                     >
//                       <Minus className="size-4" />
//                     </button>

//                     {/* Quantity Display */}
//                     <span className="text-gray-700">{quantity}</span>

//                     {/* Increase Quantity Button */}
//                     <button
//                       onClick={() => {
//                         increaseQuantity(productId);
//                         toast.success(`One more ${name} added to cart!`);
//                       }}
//                       className="rounded bg-green-600 p-1 text-white transition-colors hover:bg-green-700"
//                       aria-label={`Add one more ${name} to cart`}
//                     >
//                       <Plus className="size-4" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

// export default Products;

'use client';

import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import React from 'react';
import { toast } from 'sonner';

// Type definition matching your GraphQL schema for products
type GraphQLProduct = {
  productId: number;
  name: string;
  basePrice: string;
  mediaPaths?: string[];
  description?: string;
};

interface ProductsProps {
  products: GraphQLProduct[];
}

const Products: React.FC<ProductsProps> = ({ products }) => {
  // Access cart items and cart manipulation functions from Zustand store
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  // Helper function to get cart item by productId
  const getCartItem = (productId: number) => {
    return cartItems.find((item) => item.id === productId);
  };

  return (
    <section className="py-12 w-full">
      {/* <h2 className="mb-8 text-center text-4xl font-bold text-gray-800">Our Products</h2> */}
      <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const { productId, name, basePrice, mediaPaths } = product;
          const cartItem = getCartItem(productId);
          const quantity = cartItem?.quantity || 0;

          return (
            <div
              key={productId}
              className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="relative aspect-w-4 aspect-h-3 overflow-hidden rounded-t-lg bg-gray-50">
                {mediaPaths && mediaPaths.length > 0 ? (
                  <CldImage
                    src={mediaPaths[0]}
                    width={400}
                    height={300}
                    crop="fill"
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-700">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-grow p-4">
                {/* Product Name */}
                <h3 className="text-xl font-semibold text-gray-800">{name}</h3>

                {/* Product Price */}
                <p className="mt-2 text-lg font-medium text-gray-600">{basePrice} €</p>

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center justify-between">
                  {/* View Details Button */}
                  <Link
                    href={`/product/${productId}`}
                    className="flex items-center space-x-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700"
                  >
                    <span>View Details</span>
                  </Link>

                  {/* Add to Cart or Quantity Controls */}
                  {quantity === 0 ? (
                    // Add to Cart Button
                    <button
                      onClick={() => {
                        addToCart({
                          id: productId,
                          name,
                          price: basePrice, // Store price as string
                          image: mediaPaths && mediaPaths.length > 0 ? mediaPaths[0] : '',
                        });
                        toast.success(`${name} added to cart!`);
                      }}
                      className="flex items-center justify-center rounded bg-green-600 p-2 text-white transition-colors duration-300 hover:bg-green-700"
                      aria-label={`Add ${name} to cart`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  ) : (
                    // Quantity Controls
                    <div className="flex items-center space-x-1">
                      {/* Decrease Quantity Button */}
                      <button
                        onClick={() => {
                          decreaseQuantity(productId);
                          toast.info(`One ${name} removed from cart.`);
                        }}
                        className="flex items-center justify-center rounded bg-red-600 p-1 text-white transition-colors duration-300 hover:bg-red-700"
                        aria-label={`Remove one ${name} from cart`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      {/* Quantity Display */}
                      <span className="text-gray-700">{quantity}</span>

                      {/* Increase Quantity Button */}
                      <button
                        onClick={() => {
                          increaseQuantity(productId);
                          toast.success(`One more ${name} added to cart!`);
                        }}
                        className="flex items-center justify-center rounded bg-green-600 p-1 text-white transition-colors duration-300 hover:bg-green-700"
                        aria-label={`Add one more ${name} to cart`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Products;
