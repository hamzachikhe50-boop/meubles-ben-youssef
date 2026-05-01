import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, LogIn, Zap } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemove = async (productId, name) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      toast.success(`"${name}" retiré du panier.`);
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleUpdate = async (productId, quantity) => {
    if (quantity <= 0) return;
    const result = await updateCartItem(productId, quantity);
    if (!result.success) {
      toast.error('Erreur lors de la mise à jour de la quantité.');
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pour les visiteurs, on envoie les items explicitement car ils ne sont pas en base
      const orderData = { ...formData };
      if (!user) {
        orderData.items = cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }));
      }
      
      await ordersAPI.create(orderData);
      await clearCart();
      setOrderSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Une erreur est survenue lors de la commande.');
    } finally {
      setLoading(false);
    }
  };

  // ── Commande réussie ────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="cart-container success-view">
        <div className="success-card">
          <CheckCircle size={64} color="#27ae60" />
          <h1>Commande réussie !</h1>
          <p>
            Merci pour votre confiance. Nous vous contacterons très prochainement par
            téléphone ou par email pour confirmer les détails de la livraison.
          </p>
          <Link to="/products" className="btn btn-primary">
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  // ── Panier vide ─────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="cart-container empty-view">
        <ShoppingBag size={64} />
        <h1>Votre panier est vide</h1>
        <p>Découvrez nos collections de meubles et trouvez la pièce parfaite pour votre intérieur.</p>
        <Link to="/products" className="btn btn-primary">Voir les produits</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="page-title">Mon Panier</h1>

      {/* Bannière visiteur non connecté */}
      {!user && (
        <div className="guest-cart-banner">
          <LogIn size={18} />
          <span>
            Vous naviguez en tant que visiteur. Votre panier est sauvegardé localement.{' '}
            <Link to="/login" state={{ from: { pathname: '/cart' } }}>
              Connectez-vous
            </Link>{' '}
            pour finaliser votre commande.
          </span>
        </div>
      )}

      <div className="cart-content">
        {/* ── Liste articles ── */}
        <div className="cart-items-section">
          {cart.map((item) => (
            <div key={item.product_id} className="cart-item">
              <div className="item-image">
                <img src={item.image_url} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">{Number(item.price).toFixed(2)} TND</p>
              </div>
              <div className="item-quantity">
                <button
                  onClick={() => handleUpdate(item.product_id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  aria-label="Diminuer"
                >
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleUpdate(item.product_id, item.quantity + 1)}
                  aria-label="Augmenter"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="item-total">
                {(Number(item.price) * item.quantity).toFixed(2)} TND
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemove(item.product_id, item.name)}
                aria-label="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Résumé / Formulaire ── */}
        <div className="cart-summary-section">
          {!isOrdering ? (
            <div className="summary-card">
              <h2>Résumé</h2>
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{getCartTotal().toFixed(2)} TND</span>
              </div>
              <div className="summary-row">
                <span>Livraison</span>
                <span className="free-delivery">Gratuite</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total</span>
                <span>{getCartTotal().toFixed(2)} TND</span>
              </div>

              {user ? (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => setIsOrdering(true)}
                >
                  Passer la commande <ArrowRight size={18} />
                </button>
              ) : (
                <div className="guest-order-options">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => setIsOrdering(true)}
                  >
                    <Zap size={18} /> Commander sans compte
                  </button>
                  <div className="guest-divider"><span>ou</span></div>
                  <button
                    className="btn btn-outline btn-block"
                    onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
                  >
                    <LogIn size={18} /> Se connecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="order-form-card">
              <h2>Informations de livraison</h2>
              <form onSubmit={handleSubmitOrder} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input type="text" name="first_name" value={formData.first_name}
                      onChange={handleInputChange} required autoComplete="given-name" />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" name="last_name" value={formData.last_name}
                      onChange={handleInputChange} required autoComplete="family-name" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email}
                    onChange={handleInputChange} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="phone" value={formData.phone}
                    onChange={handleInputChange} required autoComplete="tel"
                    placeholder="Ex : 21 234 567" />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <textarea name="address" value={formData.address}
                    onChange={handleInputChange} required rows={3}
                    placeholder="Numéro, rue, quartier..." />
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input type="text" name="city" value={formData.city}
                    onChange={handleInputChange} required placeholder="Ex : Tunis" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline"
                    onClick={() => setIsOrdering(false)}>
                    Retour
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Traitement...' : 'Confirmer la commande'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
