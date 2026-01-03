export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: string; // A API retorna como string para precisão decimal
  stockQuantity: number;
  categoryId: number;
}

export interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  name?: string; // Para exibição no front-end
}

export type SaleStatus = 'OPEN' | 'COMPLETED' | 'CANCELED';

export interface SaleRequest {
  items: SaleItem[];
  customerId: number;
  paymentMethod: string;
  status: SaleStatus;
}