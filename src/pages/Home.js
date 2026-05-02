import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MessageCircle, X, Facebook, Instagram, Phone, TrendingUp } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api'; 
import './Home.css';

// --- Composant Bouton Chat Flottant ---
const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // --- État pour afficher le badge téléphone ---
  const [showPhoneBadge, setShowPhoneBadge] = useState(false);

  // --- Timer pour cacher le badge après 5 secondes ---
  useEffect(() => {
    let timer;
    if (showPhoneBadge) {
      timer = setTimeout(() => {
        setShowPhoneBadge(false);
      }, 5000); // 5000ms = 5 secondes
    }
    // Nettoyer le timer si le composant est démonté
    return () => clearTimeout(timer);
  }, [showPhoneBadge]);

  return (
    <div className="floating-contact">
      
      {/* --- BADGE TELEPHONE FLOTTANT --- */}
      {showPhoneBadge && (
        <div className="phone-float-badge">
          24531795
        </div>
      )}

      <div className={`contact-options ${isOpen ? 'show' : ''}`}>
        {/* --- MODIFICATION ICI : onClick sur le téléphone --- */}
        <a 
          href="tel:24531795" 
          className="contact-item" 
          title="Appeler"
          onClick={() => setShowPhoneBadge(true)}
        >
          <Phone size={20} color="#fff" />
        </a>
        <a href="https://www.messenger.com/t/61550016577259" target="_blank" rel="noreferrer" className="contact-item" title="Facebook Messenger">
          <MessageCircle size={20} color="#fff" />
        </a>
        <a href="https://www.facebook.com/profile.php?id=61550016577259" target="_blank" rel="noreferrer" className="contact-item" title="Facebook Page">
          <Facebook size={20} color="#fff" />
        </a>
        <a href="https://www.instagram.com/meuble_ben_youssef_/" target="_blank" rel="noreferrer" className="contact-item" title="Instagram">
          <Instagram size={20} color="#fff" />
        </a>
      </div>
      
      <button 
        className={`chat-button ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contactez-nous"
      >
        {isOpen ? <X size={28} color="#fff" /> : <MessageCircle size={28} color="#fff" />}
      </button>
    </div>
  );
};

const Home = () => {
  const [allProducts, setAllProducts] = useState([]); 
  const [featuredProducts, setFeaturedProducts] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupération des produits et catégories uniquement (pas de statsAPI)
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(), 
        categoriesAPI.getAll()
      ]);
      
      const products = productsRes.data.products;
      setAllProducts(products);
      
      const featured = products.filter(p => p.is_featured === true);
      setFeaturedProducts(featured);
      
      setCategories(categoriesRes.data.categories);

      // Top produits vide (car route admin protégée)
      setTopProducts([]); 

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(prevId => (prevId === categoryId ? null : categoryId));
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            
            <div className="mobile-univers-header">
              <button className="mobile-univers-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span>Nos Catalogue</span>
                <span className="mobile-toggle-icon">{mobileMenuOpen ? '-' : '+'}</span>
              </button>
            </div>

            {/* Sidebar Catalogue (Visible sur mobile si mobileMenuOpen est true) */}
            <div className={`hero-sidebar ${mobileMenuOpen ? 'mobile-visible' : ''}`}>
              <h3 className="sidebar-title">Nos Catalogue</h3>
              <ul className="sidebar-list">
                {categories.map((category) => (
                  <li key={category.id}>
                    <div 
                      className="sidebar-link" 
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      <span className="dropdown-toggle">
                        {expandedCategory === category.id ? '-' : '+'}
                      </span>
                    </div>

                    {expandedCategory === category.id && (
                      <ul className="sidebar-sublist open">
                        {allProducts
                          .filter(product => String(product.category_id) === String(category.id))
                          .map((product) => (
                            <li key={product.id}>
                              <Link to={`/products/${product.id}`} className="sidebar-product-link">
                                {product.name}
                              </Link>
                            </li>
                          ))
                        }
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-text">
              <h1 className="hero-title fade-in">
                Transformez votre espace
                <span className="hero-accent"> avec élégance</span>
              </h1>
              <h1 className="hero-description fade-in">
                Découvrez notre collection exclusive de meubles design, 
                alliant confort moderne et artisanat haute qualité
              </h1>
              <div className="hero-actions fade-in">
                <Link to="/products" className="btn btn-primary">
                  Découvrir la collection
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="hero-image fade-in">
              <img 
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200" 
                alt="Salon moderne" 
              />
              <div className="hero-badge">
                <Star size={16} fill="currentColor" />
                <span>Design Premium</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Produits en Vedette</h2>
            <p>Nos coups de cœur de la saison</p>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <Link 
                to={`/products/${product.id}`} 
                key={product.id}
                className="product-card card fade-in"
              >
                <div className="product-image">
                  <img src={product.image_url} alt={product.name} />
                  <div className="product-badge badge">Vedette</div>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category_name}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-footer">
                    <span className="product-price">{Number(product.price).toFixed(2)} TND</span>
                    <span className="product-stock">
                      {product.stock_quantity > 0 ? 'En stock' : 'Rupture'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/products" className="btn btn-accent">
              Voir tous les produits
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon">🚚</div>
              <h3>Livraison </h3>
              <p>Dans tout la Tunisie</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">⭐</div>
              <h3>Qualité Premium</h3>
              <p>Meubles soigneusement sélectionnés</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">🔒</div>
              <h3>Paiement Sécurisé</h3>
              <p>Transactions 100% sécurisées</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">💬</div>
              <h3>Support Client</h3>
              <p>Assistance 7j/7 pour vous aider</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TOP PRODUITS: Masquée car topProducts est vide */}
      {topProducts.length > 0 && (
        <section className="top-products-section">
          <div className="container">
            <div className="section-header">
              <h2><TrendingUp size={20} style={{display:'inline', verticalAlign:'middle', marginRight:'10px'}}/> Top Produits</h2>
              <p>Les articles les plus vendus cette semaine</p>
            </div>
            <div className="top-list-container">
              <ul className="top-list-elegant">
                {topProducts.slice(0, 5).map((product, index) => (
                  <li key={index} className="top-item-elegant">
                    <span className="top-rank-elegant">{index + 1}</span>
                    <Link to={`/products/${product.id}`} className="top-link-elegant">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER: Style élégant 4 colonnes */}
      

      <FloatingContact />
    </div>
  );
};

export default Home;