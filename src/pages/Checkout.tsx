import React, { useEffect, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import api from '../api/api';
import type { Product } from '../types/index';
import { AuthContext } from '../contexts/AuthContext';
import { Trash2, ChevronLeft, ChevronRight, Search, ShoppingCart } from 'lucide-react';

interface CartItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  name: string;
}

export const Checkout: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('CARTAO');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const { } = useContext(AuthContext);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCustomers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      toast.error('Erro ao carregar produtos');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
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
      toast.success(`${product.name} - Quantidade aumentada!`);
    } else {
      setCart([...cart, { 
        productId: product.id, 
        quantity: 1, 
        unitPrice: Number(product.price),
        discount: 0,
        name: product.name 
      }]);
      toast.success(`${product.name} adicionado ao carrinho!`);
    }
  };

  const removeFromCart = (productId: number) => {
    const item = cart.find(i => i.productId === productId);
    setCart(cart.filter(i => i.productId !== productId));
    if (item) {
      toast.success(`${item.name} removido do carrinho!`);
    }
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
      toast.error('Carrinho vazio!');
      return;
    }

    if (!selectedCustomer) {
      toast.error('Selecione um cliente!');
      return;
    }

    // Validar estoque disponível
    const stockErrors: string[] = [];
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        if (item.quantity > product.stockQuantity) {
          stockErrors.push(
            `${product.name}: você tentou adicionar ${item.quantity} unidade(s), mas há apenas ${product.stockQuantity} em estoque`
          );
        }
      }
    });

    if (stockErrors.length > 0) {
      const errorMessage = stockErrors.join('\n\n');
      toast.error(`❌ Erro de Estoque:\n${errorMessage}`, {
        duration: 5000,
        style: {
          maxWidth: '400px',
          whiteSpace: 'pre-wrap',
        },
      });
      return;
    }
    
    setLoading(true);
    try {
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
      toast.success("Venda realizada com sucesso!");
      setCart([]);
      setDiscountAmount(0);
      setSelectedCustomer(1);
      setPaymentMethod('CARTAO');
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      toast.error('Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (item: CartItem) => {
    const subtotal = item.unitPrice * item.quantity;
    const discountAmount = item.discount || 0;
    return Math.max(0, subtotal - discountAmount);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (item.discount || 0), 0) + discountAmount;
  const total = Math.max(0, subtotal - totalDiscount);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { badge: 'Sem Estoque', color: 'bg-red-100 text-red-800' };
    if (quantity <= 5) return { badge: 'Baixo Estoque', color: 'bg-yellow-100 text-yellow-800' };
    return { badge: 'Em Estoque', color: 'bg-green-100 text-green-800' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <Layout title="Nova Venda">
      <div className="w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Header with Station Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">SwiftPOS</h1>
                  <p className="text-gray-500 text-sm">Estação #01 • Terminal Principal</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">#{Math.floor(Math.random() * 9000) + 1000}</div>
                  <p className="text-gray-500 text-sm">Número do Pedido</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Pesquisar produtos por nome, SKU ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos os Itens
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {paginatedProducts.map(product => {
                const stockStatus = getStockStatus(product.stockQuantity);
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col cursor-pointer hover:border-blue-400 border border-transparent"
                  >
                    {/* Product Image */}
                    <div className="relative bg-gray-100 h-32 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <ShoppingCart size={32} className="mx-auto mb-2" />
                          <span className="text-xs">Sem imagem</span>
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                        {stockStatus.badge}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-xs text-gray-500 mb-1">{product.sku.toUpperCase()}</p>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-1">{product.description}</p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-blue-600">R${parseFloat(product.price).toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity === 0}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-medium transition"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">Nenhum produto encontrado</p>
                <p className="text-gray-400 text-sm">Tente ajustar a pesquisa ou categoria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIdx + 1} a {Math.min(startIdx + ITEMS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length} produtos
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else {
                          if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded text-sm ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg sticky top-20">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={24} className="text-blue-600" />
                  Pedido Atual
                </h2>
                <p className="text-blue-600 text-sm mt-1">#{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>

              {/* Cart Items */}
              <div className="border-b border-gray-200 space-y-2 max-h-64 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">Carrinho vazio</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      const hasStockError = product && item.quantity > product.stockQuantity;
                      return (
                        <div 
                          key={item.productId} 
                          className={`bg-gray-50 rounded p-3 text-sm border ${
                            hasStockError ? 'border-red-300 bg-red-50' : 'border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-xs line-clamp-1">{item.name}</p>
                              <p className="text-gray-600 text-xs">R${item.unitPrice.toFixed(2)}</p>
                              {hasStockError && (
                                <p className="text-red-600 text-xs mt-1">
                                  ⚠️ Estoque insuficiente! (Disponível: {product?.stockQuantity})
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-600 hover:text-red-700 ml-2"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded text-xs">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-200"
                              >
                                −
                              </button>
                              <span className="px-2 py-1 border-l border-r border-gray-300 font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-semibold text-gray-900">
                              R${calculateItemTotal(item).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              <div className="p-4 space-y-3">
                {/* Customer Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CARTAO">Cartão</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>

                {/* Discount Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">R${subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descontos:</span>
                      <span className="font-semibold text-red-600">-R${totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between text-sm">
                    <span className="text-gray-600">Taxa de Venda (8%):</span>
                    <span className="text-gray-900">R${(total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">TOTAL A PAGAR:</span>
                    <span className="text-2xl font-bold text-blue-600">R${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setDiscountAmount(0)}
                    disabled={cart.length === 0}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Aplicar Desconto
                  </button>
                  <button
                    onClick={() => {
                      setCart([]);
                      setDiscountAmount(0);
                      toast.success('Carrinho limpo!');
                    }}
                    disabled={cart.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Limpar Carrinho
                  </button>
                  <button
                    onClick={handleFinishSale}
                    disabled={loading || cart.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    {loading ? 'Processando...' : 'Finalizar Venda'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};