import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { ShoppingBag, Eye, Edit, CheckCircle, XCircle, Truck, Package, Phone, Mail, MapPin } from 'lucide-react';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setSelectedOrder(response.data.order);
      setShowModal(true);
    } catch (err) {
      alert('Erreur lors du chargement des détails de la commande');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const response = await ordersAPI.getById(orderId);
        setSelectedOrder(response.data.order);
      }
      alert('Statut de la commande mis à jour');
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'en_attente': { label: 'En attente', class: 'status-pending' },
      'confirmee': { label: 'Confirmée', class: 'status-confirmed' },
      'expediee': { label: 'Expédiée', class: 'status-shipped' },
      'livree': { label: 'Livrée', class: 'status-delivered' },
      'annulee': { label: 'Annulée', class: 'status-cancelled' }
    };
    const badge = badges[status] || { label: status, class: '' };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) return <div className="admin-loading">Chargement des commandes...</div>;

  return (
    <div className="admin-orders">
      <div className="admin-section-header">
        <h2>Gestion des Commandes</h2>
        <p>{orders.length} commandes au total</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.first_name} {order.last_name}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.total_amount.toLocaleString()} €</td>
                <td>{getStatusBadge(order.status)}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action view" 
                    onClick={() => handleViewDetails(order.id)}
                    title="Voir les détails"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">Aucune commande enregistrée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Détails de Commande */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-details-modal">
            <div className="modal-header">
              <h3>Détails de la Commande #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="details-section">
                  <h4><Phone size={18} /> Informations Client</h4>
                  <p><strong>Nom :</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p><strong>Email :</strong> {selectedOrder.email}</p>
                  <p><strong>Téléphone :</strong> {selectedOrder.phone}</p>
                </div>
                
                <div className="details-section">
                  <h4><MapPin size={18} /> Adresse de Livraison</h4>
                  <p>{selectedOrder.address}</p>
                  <p>{selectedOrder.city}</p>
                </div>
                
                <div className="details-section status-management">
                  <h4><Package size={18} /> Statut Actuel : {getStatusBadge(selectedOrder.status)}</h4>
                  <div className="status-actions">
                    <label>Changer le statut :</label>
                    <select 
                      value={selectedOrder.status} 
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="confirmee">Confirmée</option>
                      <option value="expediee">Expédiée</option>
                      <option value="livree">Livrée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="order-items-list">
                <h4>Produits Commandés</h4>
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Prix Unitaire</th>
                        <th>Quantité</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="product-cell">
                            <img src={item.image_url} alt={item.product_name} />
                            <span>{item.product_name}</span>
                          </td>
                          <td>{item.price_at_purchase.toLocaleString()} €</td>
                          <td>{item.quantity}</td>
                          <td>{(item.price_at_purchase * item.quantity).toLocaleString()} €</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="total-label">Total de la commande</td>
                        <td className="total-value">{selectedOrder.total_amount.toLocaleString()} €</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
