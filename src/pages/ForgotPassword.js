import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      // On affiche toujours le succès pour éviter l'énumération d'emails
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ maxWidth: '480px' }}>
          <div className="auth-card card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <CheckCircle size={56} color="#27ae60" style={{ marginBottom: '1rem' }} />
            <h2>Email envoyé !</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de
              réinitialisation dans quelques minutes. Vérifiez aussi vos spams.
            </p>
            <Link to="/login" className="btn btn-primary">
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '480px' }}>
        <div className="auth-card card">
          <div className="auth-header">
            <Mail size={40} style={{ margin: '0 auto 1rem', display: 'block', color: '#8B5E3C' }} />
            <h2>Mot de passe oublié</h2>
            <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="votre@email.com"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
