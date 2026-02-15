import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { ResponsiveTable } from '../components/ResponsiveTable';
import api, { uploadProductImage } from '../api/api';
import { Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import type { Product } from '../types/index';

const ITEMS_PER_PAGE = 10;

export const Products = () => {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [stockToAdd, setStockToAdd] = useState<string>('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      if ((error as any)?.response?.status === 401) {
        signOut();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let productId = editingId;

      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        const response = await api.post('/products', {
          ...formData,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          categoryId: parseInt(formData.categoryId),
        });
        productId = response.data.id;
        toast.success('Produto criado com sucesso!');
      }

      // Upload image if one was selected
      if (imageFile && productId) {
        setUploadingImage(true);
        try {
          await uploadProductImage(productId, imageFile);
          toast.success('Imagem enviada com sucesso!');
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          toast.error('Produto salvo, mas houve erro no upload da imagem');
        } finally {
          setUploadingImage(false);
        }
      }

      setShowForm(false);
      setEditingId(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
      });
      loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.categoryId.toString(),
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Produto deletado com sucesso!');
        loadProducts();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        toast.error('Erro ao deletar produto');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem não pode ter mais de 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato de imagem inválido. Use JPEG, PNG, WebP ou GIF');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'SEM ESTOQUE', color: 'bg-red-100', textColor: 'text-red-800', badgeColor: 'bg-red-500' };
    if (quantity <= 10) return { label: 'ESTOQUE BAIXO', color: 'bg-yellow-100', textColor: 'text-yellow-800', badgeColor: 'bg-yellow-500' };
    return { label: 'EM ESTOQUE', color: 'bg-green-100', textColor: 'text-green-800', badgeColor: 'bg-green-500' };
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading && products.length === 0) {
    return (
      <Layout title="Produtos">
        <div className="text-center">Carregando produtos...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Produtos">
      <div className="max-w-6xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setImageFile(null);
              setImagePreview(null);
              setFormData({
                sku: '',
                name: '',
                description: '',
                price: '',
                stockQuantity: '',
                categoryId: '',
              });
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Novo Produto</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Form Modal - Novo Design */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-5xl my-4 md:my-8">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Product Media */}
                  <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Mídia do Produto</h3>
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Editar
                        </button>
                      </div>

                      {/* Image Preview Area */}
                      <div className="mb-6">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Prévia"
                              className="w-full h-64 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center">
                              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                              <p className="text-gray-500 text-sm">Sem imagem</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Upload Input */}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-input"
                      />
                      <label
                        htmlFor="image-input"
                        className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-center"
                      >
                        <span className="text-sm text-gray-600 font-medium">
                          {imageFile ? imageFile.name : 'Escolher imagem'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Máx 5MB (JPEG, PNG, WebP, GIF)</p>
                    </div>
                  </div>

                  {/* Right Column - Product Details */}
                  <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                    {/* General Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h3>
                      <p className="text-sm text-gray-600 mb-4">Atualize os detalhes do produto</p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código SKU</label>
                            <input
                              type="text"
                              value={formData.sku}
                              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                              placeholder="NK-AIR-2024-RED"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <select
                              value={formData.categoryId}
                              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              required
                            >
                              <option value="">Selecionar categoria</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nike Air Max Precision"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade Atual</label>
                            <input
                              type="number"
                              value={formData.stockQuantity}
                              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                              placeholder="12"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              placeholder="129.99"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Premium leather and mesh upper for breathability and style. Max Air unit provides responsive cushioning, rubber outsole for durable traction."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inventory Status */}
                    {editingId && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Estoque</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Status</p>
                            {(() => {
                              const status = getStockStatus(parseInt(formData.stockQuantity) || 0);
                              return (
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${status.badgeColor}`}></div>
                                  <span className={`font-semibold text-sm ${status.textColor}`}>{status.label}</span>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Unidades em Estoque</p>
                            <p className="text-3xl font-bold text-gray-900">{formData.stockQuantity || 0}</p>
                          </div>
                        </div>

                        {/* Add Stock Section */}
                        <div className="mt-4 bg-blue-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Estoque</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={stockToAdd}
                              onChange={(e) => setStockToAdd(e.target.value)}
                              placeholder="Quantidade"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (stockToAdd && parseInt(stockToAdd) > 0) {
                                  const newQty = (parseInt(formData.stockQuantity) || 0) + parseInt(stockToAdd);
                                  setFormData({ ...formData, stockQuantity: newQty.toString() });
                                  setStockToAdd('');
                                  toast.success('Estoque adicionado!');
                                }
                              }}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                            >
                              Adicionar
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Ponto de recompra recomendado: 20 unidades</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    {uploadingImage ? '⏳ Salvando...' : '💾 Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <ResponsiveTable
          columns={[
            { key: 'sku', label: 'SKU' },
            { key: 'name', label: 'Nome' },
            {
              key: 'price',
              label: 'Preço',
              render: (value) => `R$ ${value}`,
            },
            {
              key: 'stockQuantity',
              label: 'Estoque',
              className: 'text-center',
            },
          ]}
          data={paginatedProducts}
          actions={[
            {
              label: 'Editar',
              icon: <Edit size={18} />,
              onClick: (product) => handleEdit(product as Product),
              className: 'text-blue-600 hover:bg-blue-100',
            },
            {
              label: 'Deletar',
              icon: <Trash2 size={18} />,
              onClick: (product) => handleDelete((product as Product).id),
              className: 'text-red-600 hover:bg-red-100',
            },
          ]}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          getRowKey={(product) => (product as Product).id}
          emptyMessage="Nenhum produto encontrado"
        />
      </div>
    </Layout>
  );
};
