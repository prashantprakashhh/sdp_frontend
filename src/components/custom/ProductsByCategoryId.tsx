'use client';

import Products from '@/components/custom/Products'; // The component that expects a products array
import { GET_PRODUCTS_BY_CATEGORY } from '@/graphql/queries'; // Your custom query
import { useQuery } from '@apollo/client';

export default function ProductsByCategoryId({ categoryId: categoryId }) {

    // Query products by category
    const { data, loading, error } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
        variables: { categoryId },
        skip: categoryId === null, // Skip if no category provided
        fetchPolicy: 'network-only',
    });

    if (categoryId === null) return <p className="mt-10 text-center">No category selected.</p>;
    if (loading) return <p className="mt-10 text-center">Loading products...</p>;
    if (error) {
        console.error(error);
        return <p className="mt-10 text-center text-red-500">Error loading products: {error.message}</p>;
    }

    const products = data?.productsWithId?.products || [];

    return (
        <div className="container mx-auto p-4">
            {products.length === 0 ? (
                <p className="text-center">No products found for this category.</p>
            ) : (
                <div className="block">
                    <Products products={products} />
                </div>
            )}
        </div>
    );
}