import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import './Auth.css';

// ── Règles de validation du mot de passe ────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',  label: 'Au moins 8 caractères',         test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Au moins une majuscule',         test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'Au moins une minuscule',         test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'Au moins un chiffre',            test: (p) => /\d/.test(p) },
];

const PasswordStrength = ({ password }) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strength = ['Trop faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][passed];
  const colors = ['#e74c3c', '#e74c3c', '#f39c12', '#27ae60', '#1a7a4a'];

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{ background: i < passed ? colors[passed] : '#ddd' }}
          />
        ))}
      </div>
      {password && <span style={{ color: colors[passed], fontSize: '0.8rem', fontWeight: 600 }}>{strength}</span>}
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validatePassword = (password) => {
    return PASSWORD_RULES.every((r) => r.test(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation côté client
    if (formData.first_name.trim().length < 2) {
      setError('Le prénom doit contenir au moins 2 caractères.');
      setLoading(false);
      return;
    }

    if (formData.last_name.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères.');
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Le mot de passe ne respecte pas toutes les règles requises.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;
    const result = await register(dataToSend);

    if (result.success) {
      toast.success('Compte créé avec succès ! Bienvenue 🎉');
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h2>Créer un compte</h2>
            <p>Rejoignez notre communauté</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="first_name">Prénom</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="given-name"
                  placeholder="Jean"
                />
              </div>
              <div className="input-group">
                <label htmlFor="last_name">Nom</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  autoComplete="family-name"
                  placeholder="Dupont"
                />
              </div>
            </div>

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
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-with-toggle">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
              {/* Checklist des règles */}
              {formData.password && (
                <ul className="password-rules">
                  {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(formData.password);
                    return (
                      <li key={rule.id} className={ok ? 'rule-ok' : 'rule-fail'}>
                        {ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="input-with-toggle">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`confirm-match ${formData.password === formData.confirmPassword ? 'ok' : 'fail'}`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Les mots de passe correspondent'
                    : '✕ Les mots de passe ne correspondent pas'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Création...' : "S'inscrire"}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou s'inscrire avec</span>
          </div>
          <div className="auth-footer">
            <p>
              Déjà inscrit ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h3>Pourquoi créer un compte ?</h3>
          <ul className="benefits-list">
            <li>✓ Sauvegardez votre panier</li>
            <li>✓ Suivez vos commandes</li>
            <li>✓ Accédez à des offres exclusives</li>
            <li>✓ Profitez d'une expérience personnalisée</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
