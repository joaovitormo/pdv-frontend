import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { Layout } from '../components/Layout';
import { Package, Layers, Users, ShoppingCart, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/api';
import { AuthContext } from '../contexts/AuthContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, salesRes, customersRes] = await Promise.all([
        api.get('/products'),
        api.get('/sales'),
        api.get('/customers'),
      ]);

      const products = productsRes.data;
      const sales = salesRes.data;
      const customers = customersRes.data;

      // Process sales data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3),
          fullDate: date.toISOString().split('T')[0],
          total: 0,
        };
      });

      sales.forEach((sale: any) => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        const dayData = last7Days.find(d => d.fullDate === saleDate);
        if (dayData) {
          dayData.total += parseFloat(sale.total);
        }
      });

      setSalesData(last7Days);

      // Process stock data (top 5 low stock products)
      const lowStockProducts = products
        .filter((p: any) => p.stockQuantity < 20)
        .sort((a: any, b: any) => a.stockQuantity - b.stockQuantity)
        .slice(0, 5)
        .map((p: any) => ({
          name: p.name.substring(0, 15),
          stock: p.stockQuantity,
          category: p.categoryId,
        }));

      setStockData(lowStockProducts);

      // Process payment methods data
      const paymentMethods: any = {};
      sales.forEach((sale: any) => {
        paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + 1;
      });

      const paymentChartData = Object.entries(paymentMethods).map(([method, count]: any) => ({
        name: method === 'CARTAO' ? 'Cartão' : method === 'DINHEIRO' ? 'Dinheiro' : method === 'PIX' ? 'PIX' : 'Cheque',
        value: count,
      }));

      setPaymentData(paymentChartData);

      // Calculate stats
      const totalRevenue = sales.reduce((acc: number, sale: any) => acc + parseFloat(sale.total), 0);
      const totalProducts = products.length;
      const lowStockCount = products.filter((p: any) => p.stockQuantity < 20).length;
      const totalCustomers = customers.length;

      setStats({
        totalRevenue: totalRevenue.toFixed(2),
        totalSales: sales.length,
        totalProducts,
        totalCustomers,
        lowStockCount,
        averageOrder: sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00',
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { label: 'Vendas', icon: ShoppingCart, path: '/dashboard/sales' },
    { label: 'Produtos', icon: Package, path: '/dashboard/products' },
    { label: 'Categorias', icon: Layers, path: '/dashboard/categories' },
    { label: 'Clientes', icon: Users, path: '/dashboard/customers' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-12">Carregando dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo, {user?.username || 'Usuário'}!</h1>
          <p className="text-blue-100 text-lg">Aqui está um resumo do seu negócio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ {stats?.totalRevenue}</p>
              </div>
              <DollarSign size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Vendas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalSales}</p>
              </div>
              <ShoppingCart size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ticket Médio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ {stats?.averageOrder}</p>
              </div>
              <TrendingUp size={32} className="text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Produtos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalProducts}</p>
              </div>
              <Package size={32} className="text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalCustomers}</p>
              </div>
              <Users size={32} className="text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Quick Menu */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Atalhos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all hover:border-blue-400"
                >
                  <Icon size={28} className="text-blue-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Vendas dos Últimos 7 Dias</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  name="Vendas (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats?.lowStockCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Produtos com Baixo Estoque</h3>
                <p className="text-yellow-800 mb-4">{stats?.lowStockCount} produto(s) com estoque inferior a 20 unidades</p>
                
                {stockData.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="stock" fill="#f59e0b" name="Quantidade em Estoque" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
