import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, User, LogOut, Settings,
  Package, ChevronDown, Search, UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI, categoriesAPI } from '../services/api';
import logo from './image.png';
import '../components/Header.css';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  // Mega menu
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuProducts, setMenuProducts] = useState([]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll(),
        ]);
        setMenuCategories(catRes.data.categories || []);
        setMenuProducts(prodRes.data.products || []);
      } catch {
        // Silencieux si le serveur est indisponible
      }
    };
    fetchMenuData();
  }, []);

  // Fermer le menu utilisateur si clic en dehors
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  const cartCount = getCartCount();

  return (
    <>
      {/* Bannière promotionnelle */}
      <div className="top-promo-banner">
        <p>COMMANDEZ MAINTENANT · LIVRAISON  SUR TOUTE LA TUNISIE !</p>
      </div>
        <p className="Telephone">Tél : +(216) 23 344 776</p>
        

      {/* Backdrop mobile */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <header className="header">
        <div className="header-container container">
          
          {/* Logo */}
          <Link to="/" className="logo">
            <img src={logo} alt="Logo Meubles Ben Youssef" className="logo-img" />
          </Link>

          {/* Navigation */}
          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            {/* Recherche mobile */}
            <form className="header-search-mobile" onSubmit={handleSearch}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
              />
              <button type="submit"><Search size={16} /></button>
            </form>

            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>À propos</Link>

            {/* Mega menu Produits */}
            <div className="nav-dropdown-wrapper">
              <Link to="/products" className="nav-link-with-icon" onClick={() => setMobileMenuOpen(false)}>
                Produits
                <ChevronDown size={16} className="desktop-only" />
              </Link>
              <div className="mega-menu-list">
                <div className="mega-menu-grid">
                  {menuCategories.map((category) => (
                    <div key={category.id} className="menu-row">
                      <div className="menu-category-title">{category.name}</div>
                      <div className="menu-products-list">
                        {menuProducts
                          .filter((p) => String(p.category_id) === String(category.id))
                          .slice(0, 5)
                          .map((product) => (
                            <Link
                              key={product.id}
                              to={`/products/${product.id}`}
                              className="menu-product-link"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {product.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Zone utilisateur */}
            {user ? (
              <>
                  {isAdmin() && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Settings size={18} /> Administration
                    </Link>
                  )}

                  <Link to="/cart" className="cart-link" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingCart size={20} /> Panier
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>

                  <Link to="/my-orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Package size={18} /> Mes Commandes
                  </Link>

                  {/* --- AJOUT BOUTON DÉCONNEXION MOBILE --- */}
                  <button 
                    onClick={handleLogout} 
                    className="mobile-logout-btn"
                    style={{ }}
                  >
                    <LogOut size={18} /> Déconnexion
                  </button>
                  {/* ---------------------------------------------- */}

                  {/* Menu déroulant utilisateur (desktop) */}
                  <div
                    className="user-dropdown-wrapper desktop-only"
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                  >
                    <button className="user-menu-btn">
                      <UserCircle size={20} />
                      {user.first_name}
                      <ChevronDown size={14} />
                    </button>
                    {userMenuOpen && (
                      <div className="user-dropdown">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                          <User size={15} /> Mon profil
                        </Link>
                        <button onClick={handleLogout} className="dropdown-logout">
                          <LogOut size={15} /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
              </>
            ) : (
              <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <User size={18} /> Connexion
                  </Link>
                  <Link to="/register" className="btn-register" onClick={() => setMobileMenuOpen(false)}>
                    S'inscrire
                  </Link>
              </>
            )}
          </nav>

          {/* Bouton hamburger mobile */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
       
    </>
  );
};

export default Header;