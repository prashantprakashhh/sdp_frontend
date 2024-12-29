import { gql } from '@apollo/client';

// Register Product Mutation
export const REGISTER_PRODUCT = gql`
  mutation RegisterProduct($input: RegisterProduct!) {
    registerProduct(input: $input) {
      productId
      name
      description
      basePrice
      categoryId
      supplierId
      stockQuantity
      baseProductId
      mediaPaths
    }
  }
`;

// Update Product Mutation
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: Int!, $input: RegisterProduct!) {
    updateProduct(productId: $productId, input: $input) {
      productId
      name
      description
      basePrice
      categoryId
      supplierId
      stockQuantity
      baseProductId
      mediaPaths
    }
  }
`;

// Delete Product Mutation
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: Int!) {
    deleteProduct(productId: $productId)
  }
`;

// Products With ID Query
export const PRODUCTS_WITH_ID = gql`
  query ProductsWithId($supplierId: Int!, $paginator: OrderAndPagination!) {
    productsWithId(supplierId: $supplierId, paginator: $paginator) {
      products {
        productId
        name
        description
        basePrice
        categoryId
        supplierId
        stockQuantity
        baseProductId
        mediaPaths
      }
      pageInfo {
        totalPages
        totalItems
      }
    }
  }
`;

// Get Supplier Profile Details Query
export const GET_SUPPLIER_PROFILE = gql`
  query GetSupplierProfile {
    supplierProfile {
      supplierId
      name
      contactPhone
      userId
    }
  }
`;


// Get product details with product ID
export const PRODUCTS_WITH_PRODUCTID = gql`
  query ProductsWithId($productId: Int!, $paginator: OrderAndPagination!) {
    productsWithId(productId: $productId, paginator: $paginator) {
      products {
        productId
        name
        description
        basePrice
        categoryId
        supplierId
        stockQuantity
        baseProductId
        mediaPaths
      }
      pageInfo {
        totalPages
        totalItems
      }
    }
  }
`;