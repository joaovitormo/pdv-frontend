import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import type { Product } from '../types/index';
import { AuthContext } from '../contexts/AuthContext';

export const Checkout: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      setCart(cart.map(i => 
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, unitPrice: Number(product.price), name: product.name }]);
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

  const handleFinishSale = async () => {
    if (cart.length === 0) {
      alert('Carrinho vazio!');
      return;
    }
    
    setLoading(true);
    try {
      const data = {
        items: cart,
        customerId: 1,
        paymentMethod: "CARTAO",
        status: "COMPLETED"
      };
      await api.post('/sales', data);
      alert("Venda realizada com sucesso!");
      setCart([]);
    } catch (err) {
      alert('Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const total = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">PDV - Sistema de Vendas</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Produtos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-xs mb-2">{product.description}</p>
                  <p className="text-gray-500 text-xs mb-2">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">R${parseFloat(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Estoque: {product.stockQuantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Carrinho</h2>
            <p className="text-gray-600 text-sm mt-1">Itens: {cart.length}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.productId} 
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">R${item.unitPrice.toFixed(2)}</span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-200"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 border-l border-r border-gray-300 text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        R${(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-blue-600">R${total.toFixed(2)}</span>
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
  );
};