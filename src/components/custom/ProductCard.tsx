'use client';

import React from 'react';
import { SupplierProduct } from '@/types/graphql';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { Button } from '../ui/button';

interface ProductCardProps {
  product: SupplierProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      {Array.isArray(product.mediaPaths) && product.mediaPaths.length > 0 && (
        <CldImage
          src={product.mediaPaths[0]}
          width={400}
          height={300}
          layout="responsive"
          objectFit="cover"
          alt={product.name}
        />
      )}
      <div className="p-4">
        <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
        <p className="mb-4 line-clamp-2 text-gray-600">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-600">${parseFloat(product.basePrice).toFixed(2)}</span>
          <Link href={`/product/${product.productId}`}>
            <Button variant="default" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;