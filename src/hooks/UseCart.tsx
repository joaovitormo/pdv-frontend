import { useState } from 'react';
import type { SaleItem, Product } from '../types/index';

export const useCart = () => {
  const [items, setItems] = useState<SaleItem[]>([]);

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => 
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { 
        productId: product.id, 
        quantity: 1, 
        unitPrice: parseFloat(product.price),
        name: product.name 
      }];
    });
  };

  const total = items.reduce((acc, item) => acc + (item.quantity * (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice)), 0);

  return { items, addItem, total, setItems };
};