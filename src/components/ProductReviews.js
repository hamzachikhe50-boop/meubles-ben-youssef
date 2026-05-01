import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getReviews(productId);
      setReviews(response.data.reviews);
      setStats({
        average: response.data.average_rating,
        count: response.data.review_count
      });
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitting(true);
      setError('');
      await productsAPI.addReview(productId, newReview);
      setSuccess('Merci pour votre avis !');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={star <= (interactive ? newReview.rating : rating) ? 'star-filled' : 'star-empty'}
            onClick={interactive ? () => setNewReview({ ...newReview, rating: star }) : undefined}
            style={interactive ? { cursor: 'pointer' } : {}}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="reviews-loading">Chargement des avis...</div>;

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Avis Clients</h2>
        <div className="overall-rating">
          <div className="rating-number">{stats.average.toFixed(1)}</div>
          <div className="rating-details">
            {renderStars(Math.round(stats.average))}
            <span>Basé sur {stats.count} avis</span>
          </div>
        </div>
      </div>

      {user ? (
        <div className="add-review-section">
          <h3>Laisser un avis</h3>
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="rating-selector">
              <label>Votre note :</label>
              {renderStars(newReview.rating, true)}
            </div>
            <div className="form-group">
              <label>Votre commentaire :</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Partagez votre expérience avec ce produit..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Envoi...' : <><Send size={18} /> Publier l'avis</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <p><Link to="/login">Connectez-vous</Link> pour laisser un avis sur ce produit.</p>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-user">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="user-info">
                  <span className="user-name">{review.first_name} {review.last_name}</span>
                  <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="review-content">
                {renderStars(review.rating)}
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
