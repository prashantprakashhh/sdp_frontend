export interface LoginMutationVariables {
  email: string;
  password: string;
}

export interface LoginMutationResponse {
  login: {
    token: string;
    userRole: 'customer' | 'supplier'; // Adjust as needed
  };
}

export interface CustomerProfile {
  __typename: string;
  customerId: number;
  firstName: string;
  lastName: string;
  registrationDate: string;
  userId: number;
}

export interface GetCustomerProfileData {
  customerProfile: CustomerProfile;
}

export interface GetCustomerProfileVars {
  // Define variables here if your query accepts any. In this case, there are none.
}

export interface GetSupplierProfileResponse {
  supplierId: number;
  name: string;
  contactPhone: string;
  userId: number;
}

// Input Types

export interface RegisterUser {
  email: string;
  password: string;
  role: 'customer' | 'supplier';
}

export interface RegisterCustomer {
  firstName: string;
  lastName: string;
}

export interface RegisterSupplier {
  name: string;
  contactPhone: string;
}

// Response Types
export interface RegisterUserResponse {
  registerUser: string; // Assuming it returns a success flag
}

export interface RegisterUserVars {
  input: RegisterUser;
}

export interface RegisterCustomerResponse {
  registerCustomer: {
    customerId: number;
    firstName: string;
    lastName: string;
  };
}

export interface RegisterCustomerVars {
  input: RegisterCustomer;
}

export interface RegisterSupplierResponse {
  registerSupplier: {
    supplierId: number;
    name: string;
  };
}

export interface RegisterSupplierVars {
  input: RegisterSupplier;
}

export interface LoginUserResponse {
  login: string; // Assuming 'login' returns a token as a string
}

export interface LoginUserVars {
  email: string;
  password: string;
}

// Register Product
export interface RegisterProductInput {
  name: string;
  description?: string;
  basePrice: string;
  stockQuantity: number;
  mediaPaths: string[];
  categoryId: number;
  supplierId: number;
  baseProductId: number | null;
}

export interface RegisterProductResponse {
  registerProduct: {
    productId: number;
    name: string;
    description?: string;
    basePrice: string;
    categoryId: number;
    supplierId: number;
    stockQuantity: number;
    baseProductId: number;
    mediaPaths: string[];
    __typename: string;
  };
}

export interface RegisterProductVars {
  input: RegisterProductInput;
}

// Update Product
export interface UpdateProductResponse {
  updateProduct: {
    productId: number;
    name: string;
    description?: string;
    basePrice: string;
    categoryId: number;
    supplierId: number;
    stockQuantity: number;
    baseProductId: number;
    mediaPaths: string[];
    __typename: string;
  };
}

export interface UpdateProductVars {
  productId: number;
  input: RegisterProductInput;
}

// Delete Product
export interface DeleteProductResponse {
  deleteProduct: string; // Assuming it returns a string message
}

export interface DeleteProductVars {
  productId: number;
}

// Products With ID
export interface SupplierProduct {
  productId: number;
  name: string;
  description?: string;
  basePrice: string;
  categoryId: number;
  supplierId: number;
  stockQuantity: number;
  baseProductId: number;
  mediaPaths: string[];
  __typename: string;
}

export interface PageInfo {
  totalPages: number;
  totalItems: number;
}

export interface ProductsWithIdResponse {
  productsWithId: {
    products: SupplierProduct[];
    pageInfo: PageInfo;
  };
}

export interface OrderBy {
  column: 'DATE' | 'AMOUNT';
  order: 'ASC' | 'DESC';
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface OrderAndPagination {
  orderBy: OrderBy;
  pagination: Pagination;
}

export interface ProductsWithIdVars {
  supplierId: number;
  paginator: OrderAndPagination;
}

export interface GetUser {
  userId: number;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface GetCustomerAndUserProfileData {
  customerProfile: CustomerProfile;
  getUser: GetUser;
}

export interface GetCustomerAndUserProfileVars {
  // Define variables here if needed; for this query, there are none
}

export interface Address {
  addressId: number;
  addressTypeId: number;
  addressType: string; // Assuming you have a field for addressType name
  city: string;
  country: string;
  customerId: number;
  isDefault: boolean;
  postalCode: string;
  state: string;
  streetAddress: string;
}

export interface GetAddressesData {
  addresses: Address[];
}

export interface GetAddressTypeData {
  addressType: {
    addressTypeId: number;
    name: string;
  };
}

export interface GetAddressTypeVars {
  addressTypeId: number;
}

export interface PaymentMethod {
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

export interface GetPaymentMethodData {
  paymentMethods: PaymentMethod[];
}

export interface GetPaymentMethodVars {
  // Define variables here if needed; for this query, there are none
}

export interface RegisterOrderVariables {
  input: {
    shippingAddressId: number;
    paymentMethodId: number;
    discountCode?: string;
    orderItems: {
      productId: number;
      quantity: number;
    }[];
  };
}