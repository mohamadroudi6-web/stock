import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

/* ── Stock level indicator ── */
const StockIndicator = ({ current, min }) => {
  const pct = Math.min(Math.round((current / Math.max(min * 2, 1)) * 100), 100);
  const isLow = current <= min;
  const color = isLow ? 'var(--danger)' : current <= min * 1.5 ? 'var(--warning)' : 'var(--success)';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color, letterSpacing: '-0.03em' }}>{current}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {min}</span>
      </div>
      <div className="sp-stock-bar" style={{ width: 64 }}>
        <div className="sp-stock-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/* ════════════════════════════════════
   ProductList Page
═════════════════════════════════════ */
const ProductList = () => {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta,       setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 });
  const [search,     setSearch]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status,     setStatus]     = useState('');
  const [lowStock,   setLowStock]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);

  const user    = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'admin';

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async (pg = 1, q = '', catId = '', ls = false, st = '') => {
    setLoading(true);
    try {
      let url = `/products?page=${pg}&search=${q}`;
      if (catId) url += `&category_id=${catId}`;
      if (ls)    url += `&low_stock=1`;
      if (st !== '') url += `&is_active=${st}`;
      const res = await api.get(url);
      setProducts(res.data.data);
      setMeta({
        current_page: res.data.current_page,
        last_page:    res.data.last_page,
        total:        res.data.total,
        from:         res.data.from,
        to:           res.data.to,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts(1, search, categoryId, lowStock, status);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search, categoryId, lowStock, status, fetchProducts]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProducts(newPage, search, categoryId, lowStock, status);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts(page, search, categoryId, lowStock, status);
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const hasFilters = search || categoryId || lowStock || status;

  return (
    <div>
      {/* Page header */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">Catalogue Produits</h1>
          <p className="sp-page-subtitle">
            {meta.total} produit{meta.total !== 1 ? 's' : ''} au total
          </p>
        </div>
        {isAdmin && (
          <Link to="/products/new" className="sp-btn sp-btn-primary">
            <i className="bi bi-plus-lg" />
            Nouveau Produit
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <div className="sp-card mb-4" style={{ borderRadius: 'var(--border-radius-lg)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="row g-3 align-items-end">

            {/* Search */}
            <div className="col-12 col-md-4">
              <label className="sp-form-label">Recherche</label>
              <div className="sp-input-group">
                <i className="bi bi-search sp-input-icon" />
                <input
                  type="text"
                  className="sp-form-control"
                  placeholder="Nom ou SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="col-12 col-md-3">
              <label className="sp-form-label">Catégorie</label>
              <select
                className="sp-form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-12 col-md-2">
              <label className="sp-form-label">Statut</label>
              <select
                className="sp-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </select>
            </div>

            {/* Low stock toggle */}
            <div className="col-12 col-md-2">
              <label className="sp-form-label">Filtre</label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: lowStock ? 'var(--danger-light)' : 'var(--bg-input)',
                  border: `1.5px solid ${lowStock ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => setLowStock(e.target.checked)}
                  style={{ accentColor: 'var(--danger)', width: 14, height: 14 }}
                />
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: lowStock ? 'var(--danger-dark)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Stock bas
                </span>
              </label>
            </div>

            {/* Reset */}
            <div className="col-12 col-md-1 d-flex align-items-end">
              {hasFilters && (
                <button
                  className="sp-btn sp-btn-secondary w-100"
                  onClick={() => { setSearch(''); setCategoryId(''); setLowStock(false); setStatus(''); }}
                  title="Réinitialiser les filtres"
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="sp-table-wrapper">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>SKU</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="sp-loading-overlay" style={{ padding: '40px' }}>
                      <div className="sp-spinner" />
                      <span>Chargement des produits...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="sp-loading-overlay" style={{ padding: '48px' }}>
                      <i className="bi bi-search" style={{ fontSize: 36, color: 'var(--text-muted)' }} />
                      <span>Aucun produit trouvé</span>
                      {hasFilters && (
                        <button
                          className="sp-btn sp-btn-secondary sp-btn-sm"
                          onClick={() => { setSearch(''); setCategoryId(''); setLowStock(false); setStatus(''); }}
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : products.map(p => {
                const isLow = p.current_stock <= p.min_qty;
                return (
                  <tr key={p.id} className="animate-fade-in">
                    {/* Product name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="sp-product-avatar">
                          <i className="bi bi-box-seam" style={{ fontSize: 18, color: 'var(--gray-400)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td>
                      <code style={{
                        fontSize: 12,
                        background: 'var(--gray-100)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                      }}>
                        {p.sku}
                      </code>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="sp-badge sp-badge-neutral">
                        <i className="bi bi-tag-fill" style={{ fontSize: 9 }} />
                        {p.category?.name || '—'}
                      </span>
                    </td>

                    {/* Stock */}
                    <td>
                      <StockIndicator current={p.current_stock} min={p.min_qty} />
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`sp-badge ${isLow ? 'sp-badge-danger' : 'sp-badge-success'}`}>
                        <i className={`bi ${isLow ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'}`} />
                        {isLow ? 'Critique' : 'Sain'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          to={`/products/${p.id}`}
                          className="sp-btn sp-btn-secondary sp-btn-icon sp-btn-sm"
                          title="Voir le détail"
                        >
                          <i className="bi bi-eye-fill" />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              to={`/products/edit/${p.id}`}
                              className="sp-btn sp-btn-secondary sp-btn-icon sp-btn-sm"
                              title="Modifier"
                              style={{ color: 'var(--warning)' }}
                            >
                              <i className="bi bi-pencil-fill" />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="sp-btn sp-btn-danger sp-btn-icon sp-btn-sm"
                              title="Supprimer"
                            >
                              <i className="bi bi-trash-fill" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ProductList;
