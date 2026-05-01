import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronDown, ShoppingCart, SlidersHorizontal, ImageOff, Zap } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Products.css';

// ── Fonction utilitaire pour corriger les chemins d'images ─────────────
const getImageUrl = (path) => {
  if (!path) return null;
  // Si l'URL est déjà complète (http/https), on la laisse
  if (path.startsWith('http')) return path;
  // Sinon, on ajoute l'adresse de base de l'API (Backend FastAPI)
  return `http://localhost:8000${path}`;
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="product-card skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="product-card-body">
      <div className="skeleton skeleton-text" style={{ width: '60%', height: '12px', marginBottom: '8px' }} />
      <div className="skeleton skeleton-text" style={{ width: '90%', height: '16px', marginBottom: '12px' }} />
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '20px' }} />
    </div>
  </div>
);

// ── Composant carte produit (Modifié pour gérer les erreurs images) ─────────
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    const result = await addToCart(product.id, 1, product);
    if (result.success) {
      toast.success(`"${product.name}" ajouté au panier !`);
    } else {
      toast.error(result.message || "Erreur lors de l'ajout");
    }
    setAdding(false);
  };

  const handleGuestOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/guest-checkout?product_id=${product.id}&qty=1`, { state: { product } });
  };

  // Gestion de l'image : tableau ou simple, avec correction URL
  let displayImage = null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    displayImage = getImageUrl(product.images[0]);
  } else if (product.image_url) {
    displayImage = getImageUrl(product.image_url);
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-image">
        {imgError || !displayImage ? (
          /* Placeholder si erreur ou pas d'image */
          <div className="no-image-placeholder" style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', background:'#f9f9f9', height:'200px'}}>
            <ImageOff size={40} />
          </div>
        ) : (
          /* Image principale sans loading="lazy" pour éviter l'avertissement Intervention */
          <img 
            src={displayImage} 
            alt={product.name} 
            loading="eager" 
            onError={() => setImgError(true)} 
          />
        )}
        
        {product.is_featured && <span className="featured-badge">Vedette</span>}
        {product.stock_quantity === 0 && <span className="out-badge">Épuisé</span>}
      </div>
      <div className="product-card-body">
        <span className="product-cat-label">{product.category_name}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-footer">
          <span className="product-card-price">{Number(product.price).toFixed(2)} TND</span>
          {product.stock_quantity > 0 && (
            <div className="card-action-btns" onClick={(e) => e.preventDefault()}>
              <button
                className={`btn-add-cart ${adding ? 'loading' : ''}`}
                onClick={handleAddToCart}
                disabled={adding}
                title="Ajouter au panier"
              >
                <ShoppingCart size={15} />
              </button>
              <button
                className="btn-guest-order"
                onClick={handleGuestOrder}
                title="Commander sans compte"
              >
                <Zap size={13} />
                Commander
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtres depuis l'URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const LIMIT = 12;
  const debounceRef = useRef(null);

  // Charger les catégories une seule fois
  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  // Charger les produits à chaque changement de filtres
  const fetchProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {
        page: f.page,
        limit: LIMIT,
        ...(f.search && { search: f.search }),
        ...(f.category_id && { category_id: f.category_id }),
        ...(f.min_price && { min_price: f.min_price }),
        ...(f.max_price && { max_price: f.max_price }),
        ...(f.in_stock && { in_stock: f.in_stock }),
        sort: f.sort,
      };
      const response = await productsAPI.getAll(params);
      setProducts(response.data.products || []);
      setTotal(response.data.total || response.data.products?.length || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);

    // Synchroniser l'URL
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters, fetchProducts]);

  // Debounce pour la recherche texte
  const handleSearchChange = (value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 350);
  };

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: '', category_id: '', min_price: '', max_price: '',
      in_stock: '', sort: 'newest', page: 1,
    });
  };

  const totalPages = Math.ceil(total / LIMIT);
  const hasActiveFilters = filters.category_id || filters.min_price ||
    filters.max_price || filters.in_stock || filters.search;

  return (
    <div className="products-page">
      {/* ── Barre de recherche & tri ─────────────────────────────────────── */}
      <div className="products-topbar">
        <div className="container">
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="search"
              className="search-input"
              placeholder="Rechercher un produit..."
              defaultValue={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="topbar-right">
            <select
              className="sort-select"
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="newest">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name_asc">Nom A–Z</option>
            </select>

            <button
              className={`btn-filters ${filtersOpen ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} />
              Filtres
              {hasActiveFilters && <span className="filter-dot" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Panneau filtres ──────────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="filters-panel">
          <div className="container">
            <div className="filters-grid">
              {/* Catégorie */}
              <div className="filter-group">
                <label>Catégorie</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => updateFilter('category_id', e.target.value)}
                >
                  <option value="">Toutes</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Prix minimum */}
              <div className="filter-group">
                <label>Prix min (TND)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.min_price}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                />
              </div>

              {/* Prix maximum */}
              <div className="filter-group">
                <label>Prix max (TND)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Illimité"
                  value={filters.max_price}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                />
              </div>

              {/* Disponibilité */}
              <div className="filter-group">
                <label>Disponibilité</label>
                <select
                  value={filters.in_stock}
                  onChange={(e) => updateFilter('in_stock', e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="1">En stock uniquement</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="btn-reset-filters" onClick={resetFilters}>
                <X size={14} /> Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Contenu ──────────────────────────────────────────────────────── */}
      <div className="container products-container">
        {/* Compteur de résultats */}
        <div className="results-info">
          {!loading && (
            <span>{total} produit{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}</span>
          )}
          {filters.search && (
            <span className="search-term"> pour « {filters.search} »</span>
          )}
        </div>

        {/* Grille produits */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <Search size={48} />
            <h2>Aucun produit trouvé</h2>
            <p>Essayez de modifier vos filtres ou votre recherche.</p>
            {hasActiveFilters && (
              <button className="btn btn-primary" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              ← Précédent
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages ||
                  Math.abs(p - filters.page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="page-dots">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`page-btn page-number ${filters.page === p ? 'active' : ''}`}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              className="page-btn"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;