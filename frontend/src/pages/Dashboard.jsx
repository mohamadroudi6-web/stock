import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

/* ── Mini chart bars (decorative) ── */
const SparkBars = ({ color }) => {
  const heights = [40, 70, 55, 85, 60, 90, 75];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36, opacity: 0.25 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 5,
          height: `${h}%`,
          borderRadius: 3,
          background: color,
          transition: 'height 0.4s ease',
        }} />
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ title, value, icon, color, bgColor, trend, trendUp }) => (
  <div className="col-12 col-sm-6 col-xxl-3">
    <div className="sp-stat-card animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="sp-stat-icon" style={{ background: bgColor }}>
            <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
          </div>
          <div className="sp-stat-label">{title}</div>
          <div className="sp-stat-value">{String(value).padStart(3, '0')}</div>
        </div>
        <SparkBars color={color} />
      </div>
      {trend && (
        <div className="sp-stat-trend" style={{ color: trendUp ? 'var(--success)' : 'var(--danger)' }}>
          <i className={`bi ${trendUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
          <span>{trend}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>ce mois</span>
        </div>
      )}
    </div>
  </div>
);

/* ── Alert Row (low stock) ── */
const AlertRow = ({ product }) => {
  const pct = Math.min(Math.round((product.current_stock / Math.max(product.min_qty * 2, 1)) * 100), 100);
  const isZero = product.current_stock === 0;
  const color = isZero ? 'var(--danger)' : 'var(--warning)';

  return (
    <div className="sp-list-item" style={{ padding: '14px 24px' }}>
      <div className="sp-movement-icon" style={{ background: isZero ? 'var(--danger-light)' : 'var(--warning-light)' }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{product.name}</p>
        <p style={{ margin: '2px 0 4px', fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {product.sku} · {product.category?.name}
        </p>
        <div className="sp-stock-bar">
          <div className="sp-stock-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontWeight: 900, fontSize: 20, color, letterSpacing: '-0.04em' }}>
          {product.current_stock}
        </span>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ min {product.min_qty}</div>
      </div>
    </div>
  );
};

/* ── Movement Row ── */
const MovementRow = ({ m }) => {
  const isIn = m.type === 'in';
  return (
    <div className="sp-list-item" style={{ padding: '14px 24px' }}>
      <div className="sp-movement-icon" style={{ background: isIn ? 'var(--success-light)' : 'var(--danger-light)' }}>
        <i
          className={`bi ${isIn ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}
          style={{ color: isIn ? 'var(--success)' : 'var(--danger)', fontSize: 16 }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{m.product?.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-muted)' }}>
          {new Date(m.movement_date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          {m.user?.name && ` · ${m.user.name}`}
        </p>
      </div>
      <div style={{
        fontWeight: 900,
        fontSize: 16,
        color: isIn ? 'var(--success)' : 'var(--danger)',
        letterSpacing: '-0.03em',
        flexShrink: 0,
      }}>
        {isIn ? '+' : '−'}{m.quantity}
      </div>
    </div>
  );
};

/* ════════════════════════════════════
   Dashboard Page
═════════════════════════════════════ */
const Dashboard = () => {
  const [stats,     setStats]     = useState({ total_products: 0, monthly_in: 0, monthly_out: 0, low_stock: 0 });
  const [alerts,    setAlerts]    = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.stats);
        setAlerts(res.data.low_stock_products);
        setMovements(res.data.recent_movements);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
        <div className="sp-spinner" />
        <span>Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">Tableau de bord</h1>
          <p className="sp-page-subtitle">Vue d'ensemble de votre inventaire en temps réel</p>
        </div>
        <Link to="/movements/new" className="sp-btn sp-btn-primary">
          <i className="bi bi-plus-lg" />
          Nouveau mouvement
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="row g-4 mb-4 animate-stagger">
        <StatCard
          title="Total Produits"
          value={stats.total_products}
          icon="bi-box-seam-fill"
          color="#4f46e5"
          bgColor="rgba(79,70,229,0.1)"
          trend="+12 nouveaux"
          trendUp
        />
        <StatCard
          title="Entrées (Mois)"
          value={stats.monthly_in}
          icon="bi-arrow-down-left-circle-fill"
          color="#10b981"
          bgColor="rgba(16,185,129,0.1)"
          trend="+8% vs mois dernier"
          trendUp
        />
        <StatCard
          title="Sorties (Mois)"
          value={stats.monthly_out}
          icon="bi-arrow-up-right-circle-fill"
          color="#ef4444"
          bgColor="rgba(239,68,68,0.1)"
          trend="-3% vs mois dernier"
          trendUp={false}
        />
        <StatCard
          title="Alertes Stock"
          value={stats.low_stock}
          icon="bi-exclamation-triangle-fill"
          color="#f59e0b"
          bgColor="rgba(245,158,11,0.1)"
        />
      </div>

      {/* Bottom sections */}
      <div className="row g-4">

        {/* Low stock alerts */}
        <div className="col-12 col-xl-6">
          <div className="sp-card h-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="sp-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--warning)',
                  boxShadow: '0 0 0 3px rgba(245,158,11,0.2)',
                }} />
                <h2 className="sp-card-title">Stock Critique</h2>
              </div>
              <span className="sp-badge sp-badge-warning">
                <i className="bi bi-exclamation-circle" />
                {alerts.length} produits
              </span>
            </div>

            <div>
              {alerts.length === 0 ? (
                <div className="sp-loading-overlay" style={{ padding: '40px 24px' }}>
                  <i className="bi bi-check-circle-fill" style={{ fontSize: 32, color: 'var(--success)' }} />
                  <span>Aucun produit en stock critique</span>
                </div>
              ) : (
                alerts.map(p => <AlertRow key={p.id} product={p} />)
              )}
            </div>

            {alerts.length > 0 && (
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)' }}>
                <Link to="/products?low_stock=1" className="sp-btn sp-btn-secondary sp-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Voir tous les produits critiques
                  <i className="bi bi-arrow-right" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent movements */}
        <div className="col-12 col-xl-6">
          <div className="sp-card h-100 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="sp-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 0 3px rgba(79,70,229,0.2)',
                }} />
                <h2 className="sp-card-title">Mouvements Récents</h2>
              </div>
              <Link to="/movements" className="sp-btn sp-btn-secondary sp-btn-sm">
                Voir tout <i className="bi bi-arrow-right" />
              </Link>
            </div>

            <div>
              {movements.length === 0 ? (
                <div className="sp-loading-overlay" style={{ padding: '40px 24px' }}>
                  <i className="bi bi-inbox" style={{ fontSize: 32, color: 'var(--text-muted)' }} />
                  <span>Aucun mouvement récent</span>
                </div>
              ) : (
                movements.slice(0, 8).map(m => <MovementRow key={m.id} m={m} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
