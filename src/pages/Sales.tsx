import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import api from '../api/api';
import { Plus, Eye, Trash2, Search } from 'lucide-react';

interface Sale {
  id: number;
  date: string;
  total: string;
  paymentMethod: string;
  status: string;
  customerId: number;
  customer?: {
    name: string;
  };
}

export const Sales = () => {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      if ((error as any)?.response?.status === 401) {
        signOut();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
      try {
        await api.post(`/sales/${id}/cancel`);
        loadSales();
      } catch (error) {
        console.error('Erro ao cancelar venda:', error);
        alert('Erro ao cancelar venda');
      }
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await api.get(`/sales/${id}`);
      setSelectedSale(response.data);
      setShowDetail(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      alert('Erro ao carregar detalhes da venda');
    }
  };

  let filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && sales.length === 0) {
    return (
      <Layout title="Vendas">
        <div className="text-center">Carregando vendas...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Vendas">
      <div className="max-w-6xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <button
            onClick={() => navigate('/pdv')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Nova Venda</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente ou método de pagamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="OPEN">Aberta</option>
            <option value="COMPLETED">Completa</option>
            <option value="CANCELED">Cancelada</option>
          </select>
        </div>

        {/* Detail Modal */}
        {showDetail && selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Detalhes da Venda #{selectedSale.id}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="text-lg font-semibold">{selectedSale.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="text-lg font-semibold">
                    {new Date(selectedSale.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Pagamento</p>
                  <p className="text-lg font-semibold">{selectedSale.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-lg font-semibold ${
                    selectedSale.status === 'COMPLETED' ? 'text-green-600' :
                    selectedSale.status === 'CANCELED' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {selectedSale.status === 'COMPLETED' ? 'Completa' :
                     selectedSale.status === 'CANCELED' ? 'Cancelada' : 'Aberta'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Itens</h3>
                <div className="space-y-3">
                  {selectedSale.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">R$ {item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">Total:</p>
                  <p className="text-2xl font-bold text-green-600">R$ {selectedSale.total}</p>
                </div>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredSales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma venda encontrada
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pagamento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{sale.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{sale.customer?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">R$ {sale.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        sale.status === 'CANCELED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.status === 'COMPLETED' ? 'Completa' :
                         sale.status === 'CANCELED' ? 'Cancelada' : 'Aberta'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => handleViewDetails(sale.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Eye size={18} />
                      </button>
                      {sale.status !== 'CANCELED' && (
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};
Layout