export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: string; 
  stockQuantity: number;
  categoryId: number;
  imageUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  products?: Product[];
}

export interface Customer {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  sales?: Sale[];
}

export interface SaleItem {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  discount?: number; 
  subtotal?: string;
  saleId?: number;
  product?: Product;
}

export type SaleStatus = 'OPEN' | 'COMPLETED' | 'CANCELED';

export interface Sale {
  id: number;
  date: string;
  total: string;
  paymentMethod: string;
  status: SaleStatus;
  customerId: number;
  items: SaleItem[];
  customer?: Customer;
}

export interface SaleRequest {
  items: SaleItem[];
  customerId: number;
  paymentMethod: string;
  status: SaleStatus;
}