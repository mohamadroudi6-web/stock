import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: 'admin@stock.com', password: 'password' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', credentials);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-login-bg">
      {/* Floating blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '8%',
        width: 300, height: 300,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '62% 38% 70% 30% / 56% 44% 56% 44%',
        animation: 'blob1 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 250, height: 250,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '30% 70% 40% 60% / 50% 30% 70% 50%',
        animation: 'blob1 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <div className="sp-login-card animate-fade-in-up">
        {/* Header gradient */}
        <div className="sp-login-header">
          <div className="sp-login-logo">📦</div>
          <h1 className="sp-login-title">STOCKS-PRO</h1>
          <p className="sp-login-sub">Système de gestion de stock</p>
        </div>

        {/* Body */}
        <div className="sp-login-body">
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, marginTop: -8 }}>
            Bienvenue ! Connectez-vous pour continuer.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="sp-form-group">
              <label className="sp-form-label">
                <i className="bi bi-envelope-fill me-1" />
                Adresse e-mail
              </label>
              <div className="sp-input-group">
                <i className="bi bi-person-fill sp-input-icon" />
                <input
                  type="email"
                  className="sp-form-control"
                  placeholder="votre@email.com"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="sp-form-group" style={{ marginBottom: 24 }}>
              <label className="sp-form-label">
                <i className="bi bi-shield-lock-fill me-1" />
                Mot de passe
              </label>
              <div className="sp-input-group">
                <i className="bi bi-lock-fill sp-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="sp-form-control"
                  placeholder="••••••••"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 16,
                    zIndex: 2,
                  }}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPwd ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={`sp-alert sp-alert-danger mb-4 animate-shake`}>
                <i className="bi bi-exclamation-circle-fill" style={{ fontSize: 16, flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="sp-btn sp-btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 20px',
                fontSize: 14,
                borderRadius: 'var(--border-radius)',
              }}
            >
              {loading ? (
                <>
                  <div className="sp-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Vérification en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" />
                  Accéder au système
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              © 2026 STOCKS-PRO · Gestion intelligente de l'inventaire
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0,0) rotate(0deg) scale(1); }
          33%       { transform: translate(30px,-20px) rotate(60deg) scale(1.05); }
          66%       { transform: translate(-20px,30px) rotate(-45deg) scale(0.95); }
        }
      `}</style>
    </div>
  );
};

export default Login;
