import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  // Le footer récupère ses catégories lui-même au premier rendu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Erreur footer catégories:', error);
      }
    };
    fetchCategories();
  }, []); // Le tableau vide garantit que ça ne se lance qu'une seule fois

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>SUR MEUBLE TUNISIE</h4>
            <ul>
              <li><Link to="/presentation">Présentation</Link></li>
              <li><Link to="/about">Qui Sommes Nous</Link></li>
              <li><Link to="/contact">Contactez - nous</Link></li>
              <li><Link to="/conditions">Conditions de vente</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>CATÉGORIES POPULAIRES</h4>
            <ul>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>SERVICE CLIENT</h4>
            <ul>
              <li><Link to="/paiement">Mode de Paiement</Link></li>
              <li><Link to="/livraison">Livraison</Link></li>
              <li><Link to="/retour">Retour & Échange</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>DÉCOUVRIR</h4>
            <ul>
              <li><Link to="/magasins">Magasins Partenaires</Link></li>
              <li><Link to="/blog">Blog & Conseils</Link></li>
              <li><Link to="/catalogue">Télécharger Catalogue</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Meuble Tunisie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;