import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';


const PAGE_TITLES = {
  '/':              'Vue d\'ensemble',
  '/products':      'Catalogue Produits',
  '/products/new':  'Nouveau Produit',
  '/movements':     'Historique des Mouvements',
  '/movements/new': 'Entrée / Sortie de stock',
  '/suppliers':     'Gestion Fournisseurs',
  '/departments':   'Gestion Départements',
  '/categories':    'Gestion Catégories',
  '/users':         'Gestion Utilisateurs',
};

const Layout = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin    = user.role === 'admin';
  const isSupplier = user.role === 'supplier';

  
  const [dark, setDark] = useState(() => localStorage.getItem('sp-theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('sp-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) { }
    localStorage.clear();
    navigate('/login');
  };

  
  const currentTitle =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => location.pathname === path || location.pathname.startsWith(path + '/'))
    ?.[1] ?? 'STOCKS-PRO';

  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const roleColor = isAdmin ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'linear-gradient(135deg,#10b981,#34d399)';

  return (
    <div className="sp-layout-wrapper">

     
      <aside className="sp-sidebar">

       
        <div className="sp-sidebar-brand">
          <div className="sp-sidebar-brand-icon">📦</div>
          <div className="sp-sidebar-brand-text">
            <span className="sp-sidebar-brand-name">STOCKS-PRO</span>
            <span className="sp-sidebar-brand-sub">Management Suite</span>
          </div>
        </div>

        
        <nav className="sp-sidebar-nav">

          <div className="sp-nav-group">
            <span className="sp-nav-group-label">Principal</span>
            <SideLink to="/"         icon="bi-grid-1x2-fill"   label="Dashboard" exact />
            {!isSupplier && (
              <SideLink to="/products" icon="bi-box-seam-fill"   label="Produits" />
            )}
          </div>

          
          {!isSupplier && (
            <div className="sp-nav-group">
              <span className="sp-nav-group-label">Opérations</span>
              <SideLink to="/movements/new" icon="bi-arrow-left-right" label="Entrée / Sortie" />
              <SideLink to="/movements"     icon="bi-clock-history"    label="Historique" />
            </div>
          )}

          
          {(isAdmin || user.role === 'storekeeper') && (
            <div className="sp-nav-group">
              <span className="sp-nav-group-label">Gestion</span>
              <SideLink to="/categories"  icon="bi-tags-fill"         label="Catégories" />
              <SideLink to="/departments" icon="bi-house-door-fill"   label="Départements" />
              {isAdmin && (
                <>
                  <SideLink to="/suppliers"   icon="bi-truck"             label="Fournisseurs" />
                  <SideLink to="/users"       icon="bi-people-fill"       label="Utilisateurs" />
                </>
              )}
            </div>
          )}
        </nav>

        
        <div className="sp-sidebar-footer">
          <div className="sp-user-card">
            <div className="sp-user-avatar" style={{ background: roleColor }}>
              {initials}
            </div>
            <div className="sp-user-info">
              <div className="sp-user-name">{user.name || 'Utilisateur'}</div>
              <div className="sp-user-role">{user.role || 'guest'}</div>
            </div>
          </div>

          <button className="sp-logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left" style={{ fontSize: 15 }} />
            Déconnexion
          </button>
        </div>
      </aside>

      
      <div className="sp-main-wrapper">

        
        <header className="sp-navbar">
          <div className="sp-navbar-title">{currentTitle}</div>

          <div className="sp-navbar-actions">
            
            <label className="sp-theme-toggle" title="Mode sombre">
              <input
                type="checkbox"
                checked={dark}
                onChange={() => setDark(d => !d)}
              />
              <div className="sp-theme-track" />
            </label>

            <div className="sp-divider-v" />

            
            <button className="sp-icon-btn" title="Notifications">
              <i className="bi bi-bell-fill" />
              <span className="badge-dot" />
            </button>

            
            <button className="sp-icon-btn" title="Paramètres">
              <i className="bi bi-gear-fill" />
            </button>

            <div className="sp-divider-v" />

            
            <div className="sp-user-pill">
              <div className="sp-user-pill-avatar" style={{ background: roleColor }}>
                {initials}
              </div>
              <div>
                <div className="sp-user-pill-name">{user.name}</div>
                <div className="sp-user-pill-role">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        
        <main className="sp-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


const SideLink = ({ to, icon, label, exact = false }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) => `sp-nav-link${isActive ? ' active' : ''}`}
  >
    <i className={`bi ${icon}`} />
    <span>{label}</span>
  </NavLink>
);

export default Layout;
