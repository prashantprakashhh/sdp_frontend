import { gql } from '@apollo/client';

// Mutation to register the user
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUser!) {
    registerUser(input: $input)
  }
`;

// Mutation to register a customer
export const REGISTER_CUSTOMER = gql`
  mutation RegisterCustomer($input: RegisterCustomer!) {
    registerCustomer(input: $input) {
      customerId
      firstName
      lastName
    }
  }
`;

// Mutation to register a supplier
export const REGISTER_SUPPLIER = gql`
  mutation RegisterSupplier($input: RegisterSupplier!) {
    registerSupplier(input: $input) {
      supplierId
      name
    }
  }
`;

// Provided Mutation to login user and obtain token
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginDetails: { email: $email, password: $password }) {
      token
      userRole
      }
  }
`;


// Provided Mutation to register address of the user
export const ADDRESS_MUTATION = gql`
  mutation RegisterAddress($addressType: String!, $city: String!, $country: String!, $customerId: Int!, $isDefault: Boolean!, $postalCode: String!, $state: String!, $streetAddress: String!) {
    registerAddress(
      input: {addressType: $addressType, city: $city, country: $country, customerId: $customerId, isDefault: $isDefault, postalCode: $postalCode, state: $state, streetAddress: $streetAddress}
    ) {
      addressId
      addressTypeId
      city
      country
      customerId
      isDefault
      postalCode
      state
      streetAddress
    }
  }
`

// Provided Mutation to delete the address
export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($addressId:Int!){
    deleteAddress(addressId: $addressId)
  }
`

// Provided Mutation to update the address using address id and address type id
export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($addressType: String!, $city: String!, $country: String!, $customerId: Int!, $isDefault: Boolean!, $postalCode: String!, $state: String!, $streetAddress: String!, $addressId: Int!, $addressTypeId: Int!) {
    updateAddress(
      addressId: $addressId
      addressTypeId: $addressTypeId
      input: {addressType: $addressType, city: $city, country: $country, customerId: $customerId, isDefault: $isDefault, postalCode: $postalCode, state: $state, streetAddress: $streetAddress}
    ) {
      addressId
      addressTypeId
      city
      country
      customerId
      isDefault
      postalCode
      state
      streetAddress
    }
  }
`

// Provided Mutation to update the address type only
export const UPDATE_ADDRESS_TYPE = gql`
  mutation UpdateAddressType($addressTypeId: Int!, $name: String!) {
    updateAddressType(addressTypeId: $addressTypeId, name: $name)
  }
`

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity)
  }
`

export const UPDATE_CART_ITEM_QUANTITY = gql`
  mutation UpdateCartItemQuantity($productId: Int!, $quantity: Int!, $cartId: Int!) {
    updateCartItemQuantity(
      productId: $productId
      quantity: $quantity
      cartId: $cartId
    )
  }
`

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: Int!) {
    removeFromCart(productId: $productId)
  }
`


export const REGISTER_ORDER = gql`
  mutation RegisterOrder($input: RegisterOrder!) {
    registerOrder(input: $input) {
      orderId
      customerId
      orderDate
      totalAmount
      status
      shippingAddressId
      paymentMethodId
      discountId
    }
  }
`;

// interface for the mutation variables
export interface RegisterOrderVariables {
  input: {
    shippingAddressId: number;
    paymentMethodId: number;
    discountCode?: string;
    orderItems: Array<{
      productId: number;
      quantity: number;
    }>;
  };
}

/* 
this only for reference on how to use the above interface. as register orders takes an array as input in one of its fields, we cannot provide variables without explicitly giving a type it in graphql
TODO: remove this after reference
const result = await apolloClient.mutate<{ registerOrder: Orders }, RegisterOrderVariables>({
      mutation: REGISTER_ORDER,
      variables: {
        input: {
          shippingAddressId: 1,
          paymentMethodId: 2,
          discountCode: 'SUMMER10',
          orderItems: [
            { productId: 101, quantity: 2 },
            { productId: 102, quantity: 1 }
          ]
        }
      }
    });
*/

// we can remove this as it is not useful by either supplier or customer
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: Int!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status)
  }
`

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: Int!) {
    cancelOrder(orderId: $orderId)
  }
`

export const REGISTER_PAYMENT_METHOD = gql`
  mutation RegisterPaymentMethod($paymentType: String!, $isDefault: Boolean, $bankName: String, $accountHolderName: String, $cardNumber: String, $cardExpirationDate: NaiveDate, $iban: String, $upiId: String, $bankAccountNumber: String, $ifscCode: String, $cardTypeName: String) {
    registerPaymentMethod(
      input: {paymentType: $paymentType, isDefault: $isDefault, bankName: $bankName, accountHolderName: $accountHolderName, cardNumber: $cardNumber, cardExpirationDate: $cardExpirationDate, iban: $iban, upiId: $upiId, bankAccountNumber: $bankAccountNumber, ifscCode: $ifscCode, cardTypeName: $cardTypeName}
    ) {
      paymentMethodId
      customerId
      paymentType
      isDefault
      bankName
      accountHolderName
      cardNumber
      cardExpirationDate
      iban
      upiId
      bankAccountNumber
      ifscCode
      cardTypeId
    }
  }
`

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($paymentType: String!, $isDefault: Boolean, $bankName: String, $accountHolderName: String, $cardNumber: String, $cardExpirationDate: NaiveDate, $iban: String, $upiId: String, $bankAccountNumber: String, $ifscCode: String, $cardTypeName: String, $paymentMethodId: Int!) {
    updatePaymentMethod(
      paymentMethodId: $paymentMethodId
      input: {paymentType: $paymentType, isDefault: $isDefault, bankName: $bankName, accountHolderName: $accountHolderName, cardNumber: $cardNumber, cardExpirationDate: $cardExpirationDate, iban: $iban, upiId: $upiId, bankAccountNumber: $bankAccountNumber, ifscCode: $ifscCode, cardTypeName: $cardTypeName}
    ) {
      paymentMethodId
      customerId
      paymentType
      isDefault
      bankName
      accountHolderName
      cardNumber
      cardExpirationDate
      iban
      upiId
      bankAccountNumber
      ifscCode
      cardTypeId
    }
  }
`

export const REGISTER_REVIEW = gql`
  mutation RegisterReview($productId: Int!, $rating: Int, $reviewText: String, $reviewDate: DateTime, $mediaPaths: [String!]) {
    registerReview(
      input: {productId: $productId, rating: $rating, reviewText: $reviewText, reviewDate: $reviewDate, mediaPaths: $mediaPaths}
    ) {
      reviewId
      customerId
      productId
      rating
      reviewText
      reviewDate
      mediaPaths
    }
  }
`

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($productId: Int!, $rating: Int, $reviewText: String, $reviewDate: DateTime, $mediaPaths: [String!], $reviewId: Int!) {
    updateReview(
      reviewId: $reviewId
      input: {productId: $productId, rating: $rating, reviewText: $reviewText, reviewDate: $reviewDate, mediaPaths: $mediaPaths}
    ) {
      reviewId
      customerId
      productId
      rating
      reviewText
      reviewDate
      mediaPaths
    }
  }
`

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: Int!) {
    deleteReview(reviewId: $reviewId)
  }
`

export const REGISTER_DISCOUNT = gql`
  mutation RegisterDiscount($code: String, $description: String, $discountValue: Int!, $discountType: String!, $validFrom: DateTime, $validUntil: DateTime, $maxUses: Int, $timesUsed: Int, $productId: Int!, $categoryId: Int, $minQuantity: Int) {
    registerDiscount(
      input: {code: $code, description: $description, discountValue: $discountValue, discountType: $discountType, validFrom: $validFrom, validUntil: $validUntil, maxUses: $maxUses, timesUsed: $timesUsed, productId: $productId, categoryId: $categoryId, minQuantity: $minQuantity}
    ) {
      discountId
      code
      description
      discountValue
      discountType
      validFrom
      validUntil
      maxUses
      timesUsed
      productId
      categoryId
      minQuantity
    }
  }
`

export const UPDATE_DISCOUNT = gql`
  mutation UpdateDiscount($code: String, $description: String, $discountValue: Int!, $discountType: String!, $validFrom: DateTime, $validUntil: DateTime, $maxUses: Int, $timesUsed: Int, $productId: Int!, $categoryId: Int, $minQuantity: Int, $discountId: Int!) {
    updateDiscount(
      discountId: $discountId
      input: {code: $code, description: $description, discountValue: $discountValue, discountType: $discountType, validFrom: $validFrom, validUntil: $validUntil, maxUses: $maxUses, timesUsed: $timesUsed, productId: $productId, categoryId: $categoryId, minQuantity: $minQuantity}
    ) {
      discountId
      code
      description
      discountValue
      discountType
      validFrom
      validUntil
      maxUses
      timesUsed
      productId
      categoryId
      minQuantity
    }
  }
`

export const DELETE_DISCOUNT = gql`
  mutation DeleteDiscount($discountId: Int!, $productId: Int!) {
    deleteDiscount(discountId: $discountId, productId: $productId)
  }
`

export const SEND_EMAIL_VERIFICATION = gql`
  mutation SendEmailVerification {
    sendEmailVerification
  }
`;