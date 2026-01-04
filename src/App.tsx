import { useContext } from 'react';
import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Checkout } from './pages/Checkout';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Customers } from './pages/Customers';
import { Sales } from './pages/Sales';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/dashboard/products" element={
            <PrivateRoute><Products /></PrivateRoute>
          } />
          <Route path="/dashboard/categories" element={
            <PrivateRoute><Categories /></PrivateRoute>
          } />
          <Route path="/dashboard/customers" element={
            <PrivateRoute><Customers /></PrivateRoute>
          } />
          <Route path="/dashboard/sales" element={
            <PrivateRoute><Sales /></PrivateRoute>
          } />
          <Route path="/pdv" element={
            <PrivateRoute><Checkout /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;