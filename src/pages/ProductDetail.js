import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, ImageOff, Zap } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductReviews from '../components/ProductReviews';
import './ProductDetail.css';

// --- FONCTION DE CORRECTION DES IMAGES (AJOUTER) ---
const getImageUrl = (path) => {
  if (!path) return null;
  // Si l'URL commence déjà par http ou https, on la laisse
  if (path.startsWith('http')) return path;
  // Sinon, on ajoute l'URL de l'API (http://localhost:8000)
  return `http://localhost:8000${path}`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // État pour gérer les images brisées (fallback)
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data.product);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product.id, quantity, product);
    if (result.success) {
      toast.success(`"${product.name}" ajouté au panier !`);
    } else {
      toast.error(result.message || "Erreur lors de l'ajout au panier");
    }
    setAdding(false);
  };

  const handleGuestOrder = () => {
    navigate(`/guest-checkout?product_id=${product.id}&qty=${quantity}`, { state: { product } });
  };

  // Helper : Normalise les images en tableau avec correction d'URL
  const getImages = () => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      // On applique getImageUrl à chaque image du tableau
      return product.images.map(img => getImageUrl(img));
    }
    if (product.image_url) {
      return [getImageUrl(product.image_url)];
    }
    return [];
  };

  const images = getImages();

  // Gestion d'erreur de chargement d'image
  const handleImageError = (index) => {
    setBrokenImages(prev => ({ ...prev, [index]: true }));
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Produit non trouvé</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retour aux produits
        </button>
      </div>
    );
  }

  // Vérifier si l'image actuelle est cassée
  const currentImgUrl = images[currentImageIndex];
  const isBroken = brokenImages[currentImageIndex] || !currentImgUrl;

  return (
    <div className="product-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="product-detail-content">
          {/* ── GALERIE IMAGES (Avec correction URL) ── */}
          <div className="product-images">
            
            <div className="main-image">
              {isBroken ? (
                <div className="no-image-placeholder">
                  <ImageOff size={48} />
                  <span>Image non disponible</span>
                </div>
              ) : (
                <img 
                  src={currentImgUrl} 
                  alt={product.name} 
                  loading="eager" 
                  onError={() => handleImageError(currentImageIndex)}
                />
              )}
              
              {product.is_featured && (
                <div className="featured-badge badge">Produit Vedette</div>
              )}

              {images.length > 1 && (
                <>
                  <button 
                    className="image-nav-btn prev" 
                    onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    className="image-nav-btn next" 
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    {brokenImages[idx] ? (
                      <div className="no-image-placeholder" style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#eee'}}>X</div>
                    ) : (
                      <img src={img} alt={`Thumbnail ${idx}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── INFOS ── */}
          <div className="product-details">
            {/* ... Le reste de ton code est le même ... */}
            <div className="product-meta">
              <span className="product-category-tag">{product.category_name}</span>
              <span className={`stock-badge ${product.stock_quantity === 0 ? 'out-of-stock' : ''}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} en stock` : 'Rupture de stock'}
              </span>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-price-box">
              <span className="current-price">{Number(product.price).toFixed(2)} TND</span>
            </div>

            <p className="product-description">{product.description}</p>

            {/* ... Specs et Actions (inchangés) ... */}
            
            {(product.dimensions || product.material || product.color || product.weight) && (
              <div className="product-specs">
                <h3>Caractéristiques</h3>
                <div className="specs-grid">
                  {product.dimensions && (
                    <div className="spec-item">
                      <strong>Dimensions :</strong>
                      <span>{product.dimensions}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="spec-item">
                      <strong>Matériau :</strong>
                      <span>{product.material}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="spec-item">
                      <strong>Couleur :</strong>
                      <span>{product.color}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="spec-item">
                      <strong>Poids :</strong>
                      <span>{product.weight}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.stock_quantity > 0 && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Quantité :</label>
                  <div className="quantity-controls">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))} min="1" max={product.stock_quantity} />
                    <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} disabled={quantity >= product.stock_quantity}>+</button>
                  </div>
                </div>

                <div className="detail-action-btns">
                  <button onClick={handleAddToCart} className="btn btn-outline-primary add-to-cart-btn" disabled={adding}>
                    <ShoppingCart size={20} />
                    {adding ? 'Ajout...' : 'Ajouter au panier'}
                  </button>
                  <button onClick={handleGuestOrder} className="btn btn-primary guest-order-btn">
                    <Zap size={20} />
                    Commander maintenant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ProductReviews productId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;