import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Anti-brute force
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Destination après connexion (sauvegardée par PrivateRoute)
  const from = location.state?.from?.pathname || '/';

  // Si déjà connecté, rediriger
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  // Compte à rebours du verrouillage
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      setError(`Trop de tentatives. Réessayez dans ${countdown}s.`);
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Connexion réussie ! Bienvenue 👋');
      navigate(from, { replace: true });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(result.message);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockedUntil(until);
        setCountdown(LOCKOUT_SECONDS);
        setError(`Trop de tentatives échouées. Compte bloqué ${LOCKOUT_SECONDS}s.`);
      }
    }

    setLoading(false);
  };

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h2>Connexion</h2>
            <p>Accédez à votre compte</p>
          </div>

          {/* Message de redirection contextuel */}
          {location.state?.from && (
            <div className="alert alert-info">
              Connectez-vous pour accéder à cette page.
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="votre@email.com"
                disabled={isLocked}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isLocked}
              />
            </div>

            <div className="auth-options">
              <Link to="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>

            {attempts > 0 && !isLocked && (
              <div className="attempts-warning">
                {MAX_ATTEMPTS - attempts} tentative(s) restante(s) avant blocage temporaire.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || isLocked}
            >
              {isLocked
                ? `Bloqué (${countdown}s)`
                : loading
                ? 'Connexion...'
                : 'Se connecter'}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou continuer avec</span>
          </div>
          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="auth-link">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h3>Bienvenue chez Furniture Store</h3>
          <p>Connectez-vous pour accéder à votre panier et passer commande.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
