import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { user, login } = useAuth();
  const toast = useToast();

  // ─── Formulaire infos personnelles ─────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // ─── Formulaire changement de mot de passe ──────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // ─── Mise à jour du profil ──────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileData.first_name.trim().length < 2 || profileData.last_name.trim().length < 2) {
      toast.error('Le prénom et le nom doivent contenir au moins 2 caractères.');
      return;
    }
    setProfileLoading(true);
    try {
      await authAPI.updateProfile(profileData);
      // Mettre à jour le user en localStorage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profil mis à jour avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Changement de mot de passe ─────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[A-Z]/.test(passwordData.new_password) || !/\d/.test(passwordData.new_password)) {
      toast.error('Le mot de passe doit contenir une majuscule et un chiffre.');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setPwdLoading(true);
    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Mot de passe modifié avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mot de passe actuel incorrect.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {(user?.first_name?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h1>{user?.first_name} {user?.last_name}</h1>
            <p className="profile-email">{user?.email}</p>
            {user?.role === 'admin' && <span className="role-badge">Administrateur</span>}
          </div>
        </div>

        <div className="profile-sections">
          {/* ── Informations personnelles ── */}
          <section className="profile-card">
            <div className="profile-card-header">
              <User size={20} />
              <h2>Informations personnelles</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
              <div className="input-row">
                <div className="input-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
                <div className="input-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                <Save size={16} />
                {profileLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </form>
          </section>

          {/* ── Changement de mot de passe ── */}
          <section className="profile-card">
            <div className="profile-card-header">
              <Lock size={20} />
              <h2>Modifier le mot de passe</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="profile-form" noValidate>
              <div className="input-group">
                <label>Mot de passe actuel</label>
                <div className="input-with-toggle">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowCurrentPwd(!showCurrentPwd)}>
                    {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>Nouveau mot de passe</label>
                <div className="input-with-toggle">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowNewPwd(!showNewPwd)}>
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
                <Save size={16} />
                {pwdLoading ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
