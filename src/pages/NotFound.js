import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-number">404</div>
        <h1>Page introuvable</h1>
        <p>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="notfound-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Retour
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Accueil
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <Search size={16} /> Voir les produits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
