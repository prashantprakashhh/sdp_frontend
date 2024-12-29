'use client';
import { PRODUCTS_WITH_PRODUCTID } from '@/graphql/operations';
import { OrderAndPagination, ProductsWithIdResponse, ProductsWithIdVars } from '@/types/graphql';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { CldImage } from 'next-cloudinary';
import { REVIEWS_FOR_PRODUCT } from '@/graphql/queries';
const ProductPage = () => {
  //   const router = useRouter();
  const { id } = useParams();
  const [paginator, setPaginator] = useState<OrderAndPagination>({
    orderBy: { column: 'DATE', order: 'ASC' },
    pagination: { page: 1, pageSize: 10 },
  });
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery<ProductsWithIdResponse, ProductsWithIdVars>(PRODUCTS_WITH_PRODUCTID, {
    variables: { productId: Number(id) ?? 0, paginator },
    skip: !id, // Only fetch if supplierId is known
    fetchPolicy: 'network-only',
  });

  const {
    data: reviewData,
    loading: reviewLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery(REVIEWS_FOR_PRODUCT, {
    variables: {
      productId: Number(id) ?? 0, paginator
    },
    skip: !id,
    fetchPolicy: 'network-only'
  })
  console.log({ productsData });

  return (
    <>
      <div>
        <h1><strong>Product Details</strong></h1>
        {productsData && productsData.productsWithId.products.map((product) => (
          <div key={product.productId}>
            <h2><strong>Name :</strong> {product.name}</h2>
            <p><strong>Decription :</strong> {product.description}</p>
            <p><strong>Price :</strong> {product.basePrice}</p>
            {product?.mediaPaths?.[0] && (<CldImage
              src={product.mediaPaths[0]}
              width="100"
              height="100"
              crop={{ type: 'fill' }}
              alt="Uploaded image preview"
            />)}

          </div>
        ))}
        {productsLoading && <p>Loading...</p>}
        {productsError && <p>Error loading products: {productsError.message}</p>}
        {productsData && productsData.productsWithId.products.length === 0 && (
          <p>No products found for this category.</p>
        )}


        {/* Fetch and display product details based on ID */}

      </div>
      <div>
        <h1><strong>Reviews</strong></h1>
        {reviewData && reviewData.reviewsForProduct.reviews.map((review) => (
          <div key={review.reviewId}>
            <h2>Rated {review.rating}/5</h2>
            <p>{review.reviewText}</p>
            {review?.mediaPaths?.[0] && (<CldImage
              src={review.mediaPaths[0]}
              width="100"
              height="100"
              crop={{ type: 'fill' }}
              alt="Uploaded image preview"
            />)}

          </div>
        ))}
        {reviewLoading && <p>Loading Reviews ...</p>}
        {reviewsError && <p>Error loading reviews: {reviewsError.message}</p>}
        {reviewData && reviewData.reviewsForProduct.reviews.length === 0 && (
          <p>No Reviews found for this product</p>
        )}
      </div>
    </>
  );
};

export default ProductPage;

