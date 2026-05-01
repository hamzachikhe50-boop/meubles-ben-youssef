import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Zap } from 'lucide-react';
import { productsAPI, ordersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './GuestCheckout.css';

const GuestCheckout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const productId = searchParams.get('product_id');
  const qty       = parseInt(searchParams.get('qty') || '1');

  const [product, setProduct]       = useState(location.state?.product || null);
  const [quantity, setQuantity]     = useState(qty);
  const [loading, setLoading]       = useState(!location.state?.product);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', address: '', city: '',
  });

  // Charger le produit si pas dans le state
  useEffect(() => {
    if (!product && productId) {
      productsAPI.getById(productId)
        .then((r) => setProduct(r.data.product))
        .catch(() => navigate('/products'))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.phone || !formData.address || !formData.city) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await ordersAPI.create({
        ...formData,
        // Commande directe : un seul produit
        items: [{ product_id: Number(productId), quantity }],
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Succès ───────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="guest-checkout-page">
        <div className="checkout-success">
          <CheckCircle size={64} color="#27ae60" />
          <h1>Commande confirmée !</h1>
          <p>
            Merci pour votre confiance. Notre équipe vous contactera très prochainement
            au <strong>{formData.phone}</strong> pour confirmer la livraison.
          </p>
          <div className="success-actions">
            <Link to="/products" className="btn btn-primary">Continuer mes achats</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="guest-checkout-page">
      <div className="checkout-container">

        {/* ── En-tête ── */}
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="checkout-header">
          <Zap size={28} color="#8B5E3C" />
          <h1>Commander sans compte</h1>
          <p>Remplissez vos coordonnées — nous vous contactons pour confirmer.</p>
        </div>

        <div className="checkout-layout">

          {/* ── Récapitulatif produit ── */}
          {product && (
            <div className="checkout-summary">
              <h2>Votre commande</h2>
              <div className="checkout-product">
                <img src={product.image_url} alt={product.name} />
                <div className="checkout-product-info">
                  <h3>{product.name}</h3>
                  <p className="checkout-cat">{product.category_name}</p>
                  <div className="checkout-qty-row">
                    <label>Quantité :</label>
                    <div className="qty-controls">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)}>+</button>
                    </div>
                  </div>
                  <p className="checkout-price">
                    {(Number(product.price) * quantity).toFixed(2)} TND
                  </p>
                </div>
              </div>
              <div className="checkout-total-row">
                <span>Livraison</span>
                <span className="free">Gratuite</span>
              </div>
              <div className="checkout-total-row total">
                <span>Total</span>
                <span>{(Number(product?.price || 0) * quantity).toFixed(2)} TND</span>
              </div>
            </div>
          )}

          {/* ── Formulaire ── */}
          <div className="checkout-form-card">
            <h2>Vos coordonnées</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom <span className="required">*</span></label>
                  <input type="text" name="first_name" value={formData.first_name}
                    onChange={handleChange} required placeholder="Jean" />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" name="last_name" value={formData.last_name}
                    onChange={handleChange} placeholder="Dupont" />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="votre@email.com (optionnel)" />
              </div>

              <div className="form-group">
                <label>Téléphone <span className="required">*</span></label>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} required placeholder="Ex : 21 234 567" />
              </div>

              <div className="form-group">
                <label>Adresse de livraison <span className="required">*</span></label>
                <textarea name="address" value={formData.address}
                  onChange={handleChange} required rows={2}
                  placeholder="Numéro, rue, quartier..." />
              </div>

              <div className="form-group">
                <label>Ville <span className="required">*</span></label>
                <input type="text" name="city" value={formData.city}
                  onChange={handleChange} required placeholder="Ex : Tunis" />
              </div>

              <button type="submit" className="btn btn-primary btn-block checkout-submit"
                disabled={submitting}>
                <Zap size={18} />
                {submitting ? 'Traitement...' : 'Confirmer la commande'}
              </button>

              <p className="checkout-login-hint">
                Vous avez un compte ?{' '}
                <Link to={`/login`} state={{ from: { pathname: '/cart' } }}>
                  Connectez-vous
                </Link>{' '}
                pour suivre vos commandes.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestCheckout;
