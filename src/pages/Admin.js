import React, { useState } from 'react';
import { Users, Package, Tag, BarChart3, ShoppingBag } from 'lucide-react';
import AdminUsers from '../components/admin/AdminUsers';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminOrders from '../components/admin/AdminOrders';
import Dashboard from '../components/admin/Dashboard';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1>
            <BarChart3 size={36} />
            Panneau d'Administration
          </h1>
          <p>Gérez votre boutique en ligne</p>
        </div>
      </div>

      <div className="admin-content container">
        <div className="admin-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="admin-panel">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'users' && <AdminUsers />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
