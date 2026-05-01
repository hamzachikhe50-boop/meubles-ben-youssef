import React, { useState, useEffect } from 'react';
import { statsAPI } from '../../services/api';
import {
  TrendingUp, Users, ShoppingBag, Package,
  Clock, Banknote,
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getStats();
      setStats(response.data);
    } catch {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      en_attente: { label: 'En attente',  class: 'status-pending'   },
      confirmee:  { label: 'Confirmée',   class: 'status-confirmed'  },
      expediee:   { label: 'Expédiée',    class: 'status-shipped'    },
      livree:     { label: 'Livrée',      class: 'status-delivered'  },
      annulee:    { label: 'Annulée',     class: 'status-cancelled'  },
    };
    const badge = badges[status] || { label: status, class: '' };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) return <div className="admin-loading">Chargement du tableau de bord...</div>;
  if (error)   return <div className="admin-error">{error}</div>;

  return (
    <div className="dashboard">
      {/* ── Cartes KPI ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <Banknote size={24} />
          </div>
          <div className="stat-info">
            <h3>Chiffre d'Affaires</h3>
            <p className="stat-value">
              {Number(stats.total_revenue).toLocaleString('fr-TN')} TND
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <h3>Commandes</h3>
            <p className="stat-value">{stats.total_orders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Clients</h3>
            <p className="stat-value">{stats.total_customers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>Produits</h3>
            <p className="stat-value">{stats.total_products}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        {/* ── Commandes récentes ── */}
        <div className="dashboard-section recent-orders">
          <div className="section-header">
            <h2><Clock size={20} /> Commandes Récentes</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.first_name} {order.last_name}</td>
                    <td>{Number(order.total_amount).toLocaleString('fr-TN')} TND</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString('fr-TN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
                {stats.recent_orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-table">Aucune commande pour le moment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Top produits & catégories ── */}
        <div className="dashboard-side">
          <div className="dashboard-section">
            <div className="section-header">
              <h2><TrendingUp size={20} /> Top Produits</h2>
            </div>
            <div className="top-list">
              {stats.top_products.map((product, index) => (
                <div key={index} className="top-item">
                  <span className="item-rank">{index + 1}</span>
                  <div className="item-info">
                    <span className="item-name">{product.name}</span>
                    <span className="item-count">{product.total_sold} ventes</span>
                  </div>
                </div>
              ))}
              {stats.top_products.length === 0 && (
                <p className="empty-text">Aucune vente enregistrée</p>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2><Package size={20} /> Ventes par Catégorie</h2>
            </div>
            <div className="category-stats">
              {stats.sales_by_category.map((cat, index) => (
                <div key={index} className="category-stat-item">
                  <div className="cat-info">
                    <span>{cat.name}</span>
                    <span>{Number(cat.revenue).toLocaleString('fr-TN')} TND</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${stats.total_revenue > 0
                          ? (cat.revenue / stats.total_revenue) * 100
                          : 0}%`,
                        backgroundColor: '#8b7355',
                      }}
                    />
                  </div>
                </div>
              ))}
              {stats.sales_by_category.length === 0 && (
                <p className="empty-text">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
