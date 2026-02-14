import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { ResponsiveTable } from '../components/ResponsiveTable';
import api, { uploadProductImage } from '../api/api';
import { Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estoque</label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-input"
                    />
                    <label
                      htmlFor="image-input"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {imageFile ? imageFile.name : 'Clique ou arraste a imagem aqui'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Máx 5MB (JPEG, PNG, WebP, GIF)
                        </span>
                      </div>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Prévia"
                        className="max-h-40 max-w-full rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? 'Salvando imagem...' : 'Salvar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
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
