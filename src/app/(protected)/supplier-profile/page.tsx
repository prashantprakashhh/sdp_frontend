'use client';

import { useAuthStore } from '@/store/authStore';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import ConfirmModal from '@/components/custom/ConfirmModal';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  DELETE_PRODUCT,
  PRODUCTS_WITH_ID,
  REGISTER_PRODUCT,
  UPDATE_PRODUCT,
  GET_SUPPLIER_PROFILE,
} from '@/graphql/operations';

import {
  DeleteProductResponse,
  DeleteProductVars,
  OrderAndPagination,
  ProductsWithIdResponse,
  ProductsWithIdVars,
  RegisterProductResponse,
  RegisterProductVars,
  SupplierProduct,
  UpdateProductResponse,
  UpdateProductVars,
  GetSupplierProfileResponse,
} from '@/types/graphql';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CldImage } from 'next-cloudinary';

// Upload image to Cloudinary
async function uploadImage(file: File): Promise<string> {
  const CLOUD_NAME = 'dzwsakh40';
  const UPLOAD_PRESET = 'n11products';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.public_id;
}

// Zod schema for product form
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  stockQuantity: z.coerce.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  mediaPaths: z.array(z.string()).min(1, 'At least one media path is required'),
  categoryId: z.coerce.number().int('Category ID must be an integer'),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Query for categories
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      categoryId
      name
      parentCategoryId
      __typename
    }
  }
`;

const SupplierProfile: React.FC = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const setSupplier = useAuthStore((state) => state.setSupplier);
  const supplierId = useAuthStore((state) => state.supplierId);

  useEffect(() => {
    if (!token || role?.toLowerCase() !== 'supplier') {
      router.push('/signup');
    }
  }, [token, role, router]);

  // Get Supplier Profile after token and role are ensured
  const { data: supplierData, loading: supplierLoading, error: supplierError } = useQuery<
    GetSupplierProfileResponse
  >(GET_SUPPLIER_PROFILE, {
    skip: !token || role?.toLowerCase() !== 'supplier',
    onCompleted: (data) => {
      if (data?.supplierProfile) {
        const { supplierId } = data.supplierProfile;
        setSupplier(supplierId);
      }
    },
    fetchPolicy: 'network-only',
  });

  // Get categories
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES, {
    skip: !token || role?.toLowerCase() !== 'supplier',
    fetchPolicy: 'network-only',
  });

  const [paginator, setPaginator] = useState<OrderAndPagination>({
    orderBy: { column: 'DATE', order: 'ASC' },
    pagination: { page: 1, pageSize: 10 },
  });

  // Get products after we have supplierId
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery<ProductsWithIdResponse, ProductsWithIdVars>(PRODUCTS_WITH_ID, {
    variables: { supplierId: supplierId ?? 0, paginator },
    skip: !supplierId, // Only fetch if supplierId is known
    fetchPolicy: 'network-only',
  });

  const [registerProduct, { loading: addLoading }] = useMutation<
    RegisterProductResponse,
    RegisterProductVars
  >(REGISTER_PRODUCT, {
    onCompleted: () => {
      toast.success('Product added successfully!');
      refetchProducts();
      resetAddForm();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add product.');
    },
  });

  const [updateProduct] = useMutation<UpdateProductResponse, UpdateProductVars>(
    UPDATE_PRODUCT,
    {
      onCompleted: () => {
        toast.success('Product updated successfully!');
        refetchProducts();
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update product.');
      },
    }
  );

  const [deleteProductMutation] = useMutation<DeleteProductResponse, DeleteProductVars>(
    DELETE_PRODUCT,
    {
      onCompleted: () => {
        toast.success('Product deleted successfully!');
        refetchProducts();
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete product.');
      },
    }
  );

  const addFormMethods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: '',
      stockQuantity: 0,
      mediaPaths: [],
      categoryId: 1,
    },
  });

  const { handleSubmit: handleAddSubmit, reset: resetAddForm, control: addControl } = addFormMethods;

  const onAddProduct: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      await registerProduct({
        variables: {
          input: {
            name: data.name,
            description: data.description,
            basePrice: data.basePrice,
            stockQuantity: data.stockQuantity,
            mediaPaths: data.mediaPaths,
            categoryId: data.categoryId,
            supplierId: supplierId || 0,
            baseProductId: null,
          },
        },
      });
    } catch (error) {
      console.error('Add Product Error:', error);
    }
  };

  const handleUpdateProduct = async (options: { variables: UpdateProductVars }) => {
    const result = await updateProduct(options);
    return result.data || null;
  };

  const handlePageChange = (newPage: number) => {
    setPaginator((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page: newPage },
    }));
  };

  useEffect(() => {
    if (supplierId) {
      refetchProducts({ supplierId: supplierId || 0, paginator });
    }
  }, [paginator, supplierId, refetchProducts]);

  if (supplierLoading || categoriesLoading || productsLoading) return <p>Loading...</p>;
  if (supplierError) return <p>Error loading supplier: {supplierError.message}</p>;
  if (categoriesError) return <p>Error loading categories: {categoriesError.message}</p>;
  if (productsError) return <p>Error loading products: {productsError.message}</p>;

  const totalPages = productsData?.productsWithId?.pageInfo?.totalPages || 1;
  const categories = categoriesData?.categories || [];
  const products = productsData?.productsWithId?.products || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Supplier Profile</h1>

      {/* Add Product Form */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Add New Product</h2>
        <Form {...addFormMethods}>
          <form onSubmit={handleAddSubmit(onAddProduct)}>
            <div className="space-y-4">
              <FormField
                name="name"
                control={addControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Product Name</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        id="name"
                        placeholder="Enter product name"
                        className={`input ${fieldState.invalid ? 'border-red-500' : ''}`}
                        type="text"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                control={addControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        id="description"
                        placeholder="Enter product description"
                        className={`textarea ${fieldState.invalid ? 'border-red-500' : ''}`}
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="basePrice"
                control={addControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="basePrice">Base Price</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        id="basePrice"
                        placeholder="Enter base price"
                        className={`input ${fieldState.invalid ? 'border-red-500' : ''}`}
                        type="text"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="stockQuantity"
                control={addControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="stockQuantity">Stock Quantity</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        id="stockQuantity"
                        placeholder="Enter stock quantity"
                        className={`input ${fieldState.invalid ? 'border-red-500' : ''}`}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="mediaPaths"
                control={addControl}
                render={({ field, fieldState }) => {
                  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const publicId = await uploadImage(file);
                      field.onChange([publicId]);
                    }
                  };

                  return (
                    <FormItem>
                      <FormLabel htmlFor="mediaPaths">Upload Image</FormLabel>
                      <FormControl>
                        <input
                          type="file"
                          id="mediaPaths"
                          onChange={handleFileChange}
                          className={`input ${fieldState.invalid ? 'border-red-500' : ''}`}
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                      {field.value && field.value.length > 0 && (
                        <div className="mt-2">
                          <CldImage
                            src={field.value[0]}
                            width="100"
                            height="100"
                            crop={{ type: 'fill' }}
                            alt="Uploaded image preview"
                          />
                        </div>
                      )}
                    </FormItem>
                  );
                }}
              />

              <FormField
                name="categoryId"
                control={addControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="categoryId">Category</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        id="categoryId"
                        className={`select ${fieldState.invalid ? 'border-red-500' : ''}`}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      >
                        {categories.map((cat: any) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Button type="submit" variant="secondary" disabled={addLoading}>
                {addLoading && (
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-x-white" />
                )}
                Add Product
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Products List */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Your Products</h2>
        {products.length === 0 ? (
          <p>No products found. Start by adding a new product.</p>
        ) : (
          <>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">Name</th>
                  <th className="border-b px-4 py-2">Description</th>
                  <th className="border-b px-4 py-2">Base Price</th>
                  <th className="border-b px-4 py-2">Stock</th>
                  <th className="border-b px-4 py-2">Media Paths</th>
                  <th className="border-b px-4 py-2">Category ID</th>
                  <th className="border-b px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: SupplierProduct) => (
                  <ProductRow
                    key={product.productId}
                    product={product}
                    onUpdate={handleUpdateProduct}
                    onDelete={async (productId) => {
                      try {
                        await deleteProductMutation({ variables: { productId } });
                      } catch (err) {
                        console.error('Delete Product Error:', err);
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-between">
                <Button
                  onClick={() => handlePageChange(paginator.pagination.page - 1)}
                  disabled={paginator.pagination.page === 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                <span>
                  Page {paginator.pagination.page} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(paginator.pagination.page + 1)}
                  disabled={paginator.pagination.page === totalPages}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface ProductRowProps {
  product: SupplierProduct;
  onUpdate: (options: { variables: UpdateProductVars }) => Promise<UpdateProductResponse | null | undefined>;
  onDelete: (productId: number) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const editFormMethods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice,
      stockQuantity: product.stockQuantity,
      mediaPaths: product.mediaPaths,
      categoryId: product.categoryId,
    },
  });

  const { handleSubmit: handleEditSubmit, control: editControl, reset: resetEditForm } = editFormMethods;

  const onEditProduct: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      await onUpdate({
        variables: {
          productId: product.productId,
          input: {
            name: data.name,
            description: data.description,
            basePrice: data.basePrice,
            stockQuantity: data.stockQuantity,
            mediaPaths: data.mediaPaths,
            categoryId: data.categoryId,
            supplierId: product.supplierId,
            baseProductId: product.baseProductId,
          },
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update Product Error:', error);
    }
  };

  const handleCancel = () => {
    resetEditForm();
    setIsEditing(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const confirmDelete = () => {
    onDelete(product.productId);
    closeModal();
  };

  return (
    <>
      <Form {...editFormMethods}>
        <tr>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <FormField
                name="name"
                control={editControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <input {...field} className={`input ${fieldState.invalid ? 'border-red-500' : ''}`} type="text" />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            ) : (
              product.name
            )}
          </td>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <FormField
                name="description"
                control={editControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea {...field} className={`textarea ${fieldState.invalid ? 'border-red-500' : ''}`} />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            ) : (
              product.description
            )}
          </td>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <FormField
                name="basePrice"
                control={editControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <input {...field} className={`input ${fieldState.invalid ? 'border-red-500' : ''}`} type="text" />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            ) : (
              `$${parseFloat(product.basePrice).toFixed(2)}`
            )}
          </td>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <FormField
                name="stockQuantity"
                control={editControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <input {...field} className={`input ${fieldState.invalid ? 'border-red-500' : ''}`} type="number" />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            ) : (
              product.stockQuantity
            )}
          </td>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <FormField
                name="mediaPaths"
                control={editControl}
                render={({ field, fieldState }) => {
                  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const publicId = await uploadImage(file);
                      field.onChange([publicId]);
                    }
                  };
                  return (
                    <FormItem>
                      <FormLabel>Upload Image</FormLabel>
                      <FormControl>
                        <input type="file" onChange={handleFileChange} className={`input ${fieldState.invalid ? 'border-red-500' : ''}`} />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                      {field.value && field.value.length > 0 && (
                        <div className="mt-2">
                          <CldImage
                            src={field.value[0]}
                            width="100"
                            height="100"
                            crop={{ type: 'fill' }}
                            alt="Uploaded image preview"
                          />
                        </div>
                      )}
                    </FormItem>
                  );
                }}
              />
            ) : product.mediaPaths && product.mediaPaths.length > 0 ? (
              <div className="flex items-center gap-2">
                <CldImage
                  src={product.mediaPaths[0]}
                  width="50"
                  height="50"
                  crop={{ type: 'fill' }}
                  alt="Product image"
                />
                <span>{product.mediaPaths[0]}</span>
              </div>
            ) : (
              'No images'
            )}
          </td>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <FormField
                name="categoryId"
                control={editControl}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Category ID</FormLabel>
                    <FormControl>
                      <input {...field} className={`input ${fieldState.invalid ? 'border-red-500' : ''}`} type="number" />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            ) : (
              product.categoryId
            )}
          </td>
          <td className="border-b px-4 py-2">
            {isEditing ? (
              <>
                <Button type="button" variant="default" size="sm" onClick={handleEditSubmit(onEditProduct)} className="mr-2">
                  Save
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="default" size="sm" onClick={() => setIsEditing(true)} className="mr-2">
                  Edit
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={openModal}>
                  Delete
                </Button>
              </>
            )}
          </td>
        </tr>
      </Form>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${product.name}"?`}
        onConfirm={confirmDelete}
        onCancel={closeModal}
      />
    </>
  );
};

export default SupplierProfile;