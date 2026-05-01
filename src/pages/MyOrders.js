import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { Package, ShoppingBag, Edit2, XCircle, Check, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './MyOrders.css';

// ── Modal de confirmation ─────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-backdrop" onClick={onCancel}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <AlertTriangle size={32} color="#e67e22" />
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onCancel}>Non, garder</button>
        <button className="btn btn-danger" onClick={onConfirm}>Oui, annuler</button>
      </div>
    </div>
  </div>
);

// ── Étapes de statut ──────────────────────────────────────────────────────────
const STATUS_STEPS = ['en_attente', 'confirmee', 'expediee', 'livree'];

const StatusProgress = ({ status }) => {
  if (status === 'annulee') {
    return <span className="order-status status-cancelled">Annulée</span>;
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  const labels = ['En attente', 'Confirmée', 'Expédiée', 'Livrée'];

  return (
    <div className="status-progress">
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className={`step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'active' : ''}`}>
            <div className="step-dot">{i < currentIdx ? '✓' : i + 1}</div>
            <span className="step-label">{labels[i]}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`step-line ${i < currentIdx ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null); // orderId à annuler
  const [editFormData, setEditFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', address: '', city: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders();
      setOrders(response.data.orders);
    } catch {
      setError('Impossible de récupérer vos commandes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirmCancel) return;
    try {
      setActionLoading(true);
      await ordersAPI.cancelUserOrder(confirmCancel);
      await fetchOrders();
      toast.success('Commande annulée avec succès.');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'annulation.");
    } finally {
      setActionLoading(false);
      setConfirmCancel(null);
    }
  };

  const startEditing = (order) => {
    setEditingOrder(order.id);
    setEditFormData({
      first_name: order.first_name,
      last_name: order.last_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await ordersAPI.updateUserOrder(editingOrder, editFormData);
      setEditingOrder(null);
      await fetchOrders();
      toast.success('Informations de livraison mises à jour.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-container">
        <div className="orders-loading">
          <div className="spinner" />
          Chargement de vos commandes...
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <h1 className="page-title">Mes Commandes</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Modal confirmation annulation */}
      {confirmCancel && (
        <ConfirmModal
          message="Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible."
          onConfirm={handleCancelOrder}
          onCancel={() => setConfirmCancel(null)}
        />
      )}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <ShoppingBag size={64} />
          <h2>Vous n'avez pas encore passé de commande</h2>
          <p>Découvrez nos meubles et commencez votre shopping !</p>
          <Link to="/products" className="btn btn-primary">Voir les produits</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isEditing = editingOrder === order.id;

            return (
              <div key={order.id} className="order-card">
                {/* ── En-tête ── */}
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-number">Commande #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('fr-TN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="order-total-badge">
                    {Number(order.total_amount).toFixed(2)} TND
                  </div>
                </div>

                {/* ── Progression statut ── */}
                <div className="order-status-section">
                  <StatusProgress status={order.status} />
                </div>

                {/* ── Corps ── */}
                <div className="order-body">
                  {!isEditing ? (
                    <>
                      <div className="order-delivery-info">
                        <Package size={16} />
                        <span>
                          Livraison à <strong>{order.first_name} {order.last_name}</strong>
                          {' — '}{order.address}, {order.city}
                        </span>
                      </div>
                      <p className="contact-note">Tél : <strong>{order.phone}</strong></p>

                      {order.status === 'en_attente' && (
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() => startEditing(order)}
                            disabled={actionLoading}
                          >
                            <Edit2 size={16} /> Modifier la livraison
                          </button>
                          <button
                            className="btn-icon cancel"
                            onClick={() => setConfirmCancel(order.id)}
                            disabled={actionLoading}
                          >
                            <XCircle size={16} /> Annuler
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <form className="edit-order-form" onSubmit={handleUpdateOrder} noValidate>
                      <h3>Modifier les informations de livraison</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Prénom</label>
                          <input type="text" name="first_name" value={editFormData.first_name}
                            onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                          <label>Nom</label>
                          <input type="text" name="last_name" value={editFormData.last_name}
                            onChange={handleEditChange} required />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input type="email" name="email" value={editFormData.email}
                            onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                          <label>Téléphone</label>
                          <input type="tel" name="phone" value={editFormData.phone}
                            onChange={handleEditChange} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Adresse</label>
                        <input type="text" name="address" value={editFormData.address}
                          onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label>Ville</label>
                        <input type="text" name="city" value={editFormData.city}
                          onChange={handleEditChange} required />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={actionLoading}>
                          <Check size={16} /> Enregistrer
                        </button>
                        <button type="button" className="btn-cancel-edit"
                          onClick={() => setEditingOrder(null)} disabled={actionLoading}>
                          <X size={16} /> Annuler
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
