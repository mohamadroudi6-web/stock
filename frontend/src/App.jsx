import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import MovementList from './pages/MovementList';
import MovementForm from './pages/MovementForm';
import SupplierList from './pages/SupplierList';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierForm from './pages/SupplierForm';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import DepartmentList from './pages/DepartmentList';
import DepartmentForm from './pages/DepartmentForm';
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';

import Layout from './components/Layout';

const DashboardSwitch = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.role === 'supplier' ? <SupplierDashboard /> : <Dashboard />;
};

const ProtectedRoute = ({ children, roles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  if (!token) return <Navigate to="/login" />;
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardSwitch />} />
          
          {/* Admin & Magasinier uniqument */}
          <Route path="products" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <ProductList />
            </ProtectedRoute>
          } />
           <Route path="products/:id" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <ProductDetail />
            </ProtectedRoute>
          } />
          <Route path="products/new" element={
            <ProtectedRoute roles={['admin']}>
              <ProductForm />
            </ProtectedRoute>
          } />
          <Route path="products/edit/:id" element={
            <ProtectedRoute roles={['admin']}>
              <ProductForm />
            </ProtectedRoute>
          } />
          
          <Route path="movements" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <MovementList />
            </ProtectedRoute>
          } />
          <Route path="movements/new" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <MovementForm />
            </ProtectedRoute>
          } />

          {/* Admin UNIQUEMENT */}
          <Route path="categories" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <CategoryList />
            </ProtectedRoute>
          } />
          <Route path="categories/new" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <CategoryForm />
            </ProtectedRoute>
          } />
          <Route path="categories/edit/:id" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <CategoryForm />
            </ProtectedRoute>
          } />



           <Route path="suppliers" element={
            <ProtectedRoute roles={['admin']}>
              <SupplierList />
            </ProtectedRoute>
          } />
          <Route path="suppliers/new" element={
            <ProtectedRoute roles={['admin']}>
              <SupplierForm />
            </ProtectedRoute>
          } />
          <Route path="suppliers/edit/:id" element={
            <ProtectedRoute roles={['admin']}>
              <SupplierForm />
            </ProtectedRoute>
          } />

          <Route path="departments" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <DepartmentList />
            </ProtectedRoute>
          } />
          <Route path="departments/new" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <DepartmentForm />
            </ProtectedRoute>
          } />
          <Route path="departments/edit/:id" element={
            <ProtectedRoute roles={['admin', 'storekeeper']}>
              <DepartmentForm />
            </ProtectedRoute>
          } />
           <Route path="users" element={
            <ProtectedRoute roles={['admin']}>
              <UserList />
            </ProtectedRoute>
          } />
          <Route path="users/new" element={
            <ProtectedRoute roles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="users/edit/:id" element={
            <ProtectedRoute roles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
