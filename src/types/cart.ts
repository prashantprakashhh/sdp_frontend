export type Product = {
  id: number;
  name: string;
  price: string; 
  image?: string; 
  description?: string;
};

export type CartItem = Product & {
  quantity: number;
};
