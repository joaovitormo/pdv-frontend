import React, { useEffect, useState, useContext } from 'react';
import { Layout } from '../components/Layout';
import api from '../api/api';
import type { Product } from '../types/index';
import { AuthContext } from '../contexts/AuthContext';
import { Trash2, Edit2, X } from 'lucide-react';

interface CartItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  name: string;
}

export const Checkout: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('CARTAO');
  const { } = useContext(AuthContext);

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      alert('Erro ao carregar produtos');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      setCart(cart.map(i => 
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        quantity: 1, 
        unitPrice: Number(product.price),
        discount: 0,
        name: product.name 
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(i => 
        i.productId === productId ? { ...i, quantity } : i
      ));
    }
  };

  const startEdit = (item: CartItem) => {
    setEditingItem(item.productId);
    setEditPrice(item.unitPrice);
    setEditDiscount(item.discount || 0);
  };

  const saveEdit = () => {
    setCart(cart.map(i => 
      i.productId === editingItem 
        ? { ...i, unitPrice: editPrice, discount: editDiscount } 
        : i
    ));
    setEditingItem(null);
    setEditPrice(0);
    setEditDiscount(0);
  };

  const handleFinishSale = async () => {
    if (cart.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    if (!selectedCustomer) {
      alert('Selecione um cliente!');
      return;
    }
    
    setLoading(true);
    try {
      // Preparar items para a API (sem name)
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }));

      const data = {
        items,
        customerId: selectedCustomer,
        paymentMethod,
        status: "COMPLETED"
      };
      await api.post('/sales', data);
      alert("Venda realizada com sucesso!");
      setCart([]);
      setSelectedCustomer(1);
      setPaymentMethod('CARTAO');
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      alert('Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (item: CartItem) => {
    const subtotal = item.unitPrice * item.quantity;
    const discountAmount = item.discount || 0;
    return Math.max(0, subtotal - discountAmount);
  };

  const total = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);

  return (
    <Layout title="Nova Venda">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produtos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <p className="text-gray-500 text-xs mb-3">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">R${parseFloat(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
                    >
                      Adicionar
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs">Estoque: {product.stockQuantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg sticky top-8">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Carrinho</h2>
                <p className="text-gray-600 text-sm mt-1">{cart.length} item(ns)</p>
              </div>

              <div className="p-4 border-b border-gray-200 space-y-3 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div 
                        key={item.productId} 
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        {editingItem === item.productId ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs text-gray-600">Preço</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Desconto</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editDiscount}
                                  onChange={(e) => setEditDiscount(Number(e.target.value))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <button
                                onClick={saveEdit}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-1 rounded"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              <p>Preço: R${item.unitPrice.toFixed(2)}</p>
                              {item.discount ? <p>Desconto: -R${item.discount.toFixed(2)}</p> : null}
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-200 text-sm"
                                >
                                  −
                                </button>
                                <span className="px-3 py-1 border-l border-r border-gray-300 text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-200 text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => startEdit(item)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                R${calculateItemTotal(item).toFixed(2)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CARTAO">Cartão</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-semibold text-gray-900">R${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-gray-900 bg-green-50 p-3 rounded-lg">
                  <span>Total:</span>
                  <span className="text-green-600">R${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleFinishSale}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};