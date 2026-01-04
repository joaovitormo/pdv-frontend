import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Package, Layers, Users, ShoppingCart } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Vendas', icon: ShoppingCart, path: '/dashboard/sales' },
    { label: 'Produtos', icon: Package, path: '/dashboard/products' },
    { label: 'Categorias', icon: Layers, path: '/dashboard/categories' },
    { label: 'Clientes', icon: Users, path: '/dashboard/customers' },
  ];

  return (
    <Layout title="Dashboard">
      <div className="max-w-6xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo ao PDV</h2>
          <p className="text-gray-600 mb-6">
            Selecione uma opção abaixo para começar a gerenciar seus produtos, categorias, clientes e vendas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="p-6 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-all hover:shadow-md"
                >
                  <Icon size={32} className="text-blue-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};
