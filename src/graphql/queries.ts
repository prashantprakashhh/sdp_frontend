import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      categoryId
      name
      parentCategoryId
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: Int!) {
    productsWithId(
      categoryId: $categoryId
      paginator: {
        orderBy: { column: DATE, order: ASC }
        pagination: { page: 1, pageSize: 100 }
      }
    ) {
      products {
        productId
        name
        description
        basePrice
        mediaPaths
      }
      pageInfo {
        totalPages
        totalItems
      }
    }
  }
`;


export const GET_ADDRESSES = gql`
  query {
    addresses {
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

export const GET_ADDRESS_TYPE = gql`
  query AddressType($addressTypeId: Int!) {
    addressType(addressTypeId: $addressTypeId) {
      addressTypeId
      name
    }
  }
`

export const GET_CART_ITEMS = gql`
  query {
    cartItems {
      productId
      name
      description
      basePrice
      categoryId
      supplierId
      stockQuantity
      mediaPaths
      baseProductId
    }
  }
`


export const GET_ORDERS = gql`
  query {
    orders {
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
`

export const GET_ORDER_ITEMS = gql`
  query OrderItems($orderId: Int!) {
    orderItems(orderId: $orderId) {
      productId
      name
      description
      basePrice
      categoryId
      supplierId
      stockQuantity
      mediaPaths
      baseProductId
    }
  }
`

export const GET_PAYMENT_METHOD = gql`
  query {
    paymentMethods {
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

export const GET_CARD_TYPE = gql`
  query CardType($cardTypeId: Int!) {
    cardType(cardTypeId: $cardTypeId) {
      cardTypeId
      name
    }
  }
`

export const REVIEWS_FOR_PRODUCT = gql`
  query ReviewsForProduct($productId: Int!, $paginator: OrderAndPagination!) {
    reviewsForProduct(productId: $productId, paginator: $paginator) {
      reviews {
        reviewId
        customerId
        productId
        rating
        reviewText
        reviewDate
        mediaPaths
      }
      pageInfo {
        totalPages
        totalItems
      }
    }
  }
`

// export const GET_ALL_DISCOUNTS = gql`
//   query {
//     discounts {
//       discountId
//       code
//       description
//       discountValue
//       discountType
//       validFrom
//       validUntil
//       maxUses
//       timesUsed
//       productId
//       categoryId
//       minQuantity
//     }
//   }
// `

export const GET_PRODUCT_DISCOUNTS = gql`
  query DiscountsOnProduct($productId: Int!) {
    discountsOnProduct(productId: $productId) {
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
`;

export const GET_CURRENT_USER_AND_USER_PROFILE = gql`
  query GetCustomerAndUserProfile {
    customerProfile {
      customerId
      firstName
      lastName
      registrationDate
      userId
    }
    getUser {
      userId
      email
      role
      createdAt
      emailVerified
    }
  }
`;