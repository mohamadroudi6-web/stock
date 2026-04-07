import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Pagination from '../components/Pagination';

/* ── Type badge ── */
const TypeBadge = ({ type }) => {
    const isIn = type === 'in';
    return (
        <span className={`sp-badge ${isIn ? 'sp-badge-success' : 'sp-badge-danger'}`}>
            <i className={`bi ${isIn ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`} />
            {isIn ? 'Entrée' : 'Sortie'}
        </span>
    );
};

/* ═══════════════════════════════════════
   MovementList Page
═══════════════════════════════════════ */
const MovementList = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSupplierId = queryParams.get('supplier_id') || '';

    const [movements, setMovements] = useState([]);
    const [meta,      setMeta]      = useState({ current_page: 1, last_page: 1, total: 0 });
    const [search,    setSearch]    = useState('');
    const [typeFilter,setTypeFilter]= useState('');
    const [supplierId,setSupplierId]= useState(initialSupplierId);
    const [loading,   setLoading]   = useState(true);
    const [page,      setPage]      = useState(1);

    const fetchMovements = useCallback(async (pg = 1, q = '', sId = '', tFilter = '') => {
        setLoading(true);
        try {
            let url = `/movements?page=${pg}&search=${q}&per_page=10`;
            if (sId)    url += `&supplier_id=${sId}`;
            if (tFilter) url += `&type=${tFilter}`;
            const res = await api.get(url);
            setMovements(res.data.data);
            setMeta({
                current_page: res.data.current_page,
                last_page:    res.data.last_page,
                total:        res.data.total,
                from:         res.data.from,
                to:           res.data.to,
            });
        } catch (err) {
            console.error('Erreur mouvements:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            fetchMovements(1, search, supplierId, typeFilter);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search, supplierId, typeFilter, fetchMovements]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchMovements(newPage, search, supplierId, typeFilter);
    };

    return (
        <div>
            {/* Page header */}
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">Historique des Mouvements</h1>
                    <p className="sp-page-subtitle">
                        Traçabilité complète · {meta.total} opération{meta.total !== 1 ? 's' : ''} enregistrée{meta.total !== 1 ? 's' : ''}
                    </p>
                    {supplierId && (
                        <span
                            className="sp-badge sp-badge-info"
                            style={{ marginTop: 8, display: 'inline-flex', gap: 8 }}
                        >
                            <i className="bi bi-truck" />
                            Filtré par fournisseur
                            <button
                                onClick={() => setSupplierId('')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                            >
                                <i className="bi bi-x-circle-fill" style={{ fontSize: 13 }} />
                            </button>
                        </span>
                    )}
                </div>
                <Link to="/movements/new" className="sp-btn sp-btn-primary">
                    <i className="bi bi-plus-lg" />
                    Nouvelle Opération
                </Link>
            </div>

            <div className="sp-card">
                {/* Filter bar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="row g-3 align-items-end">
                        {/* Search */}
                        <div className="col-12 col-md-5">
                            <div className="sp-input-group">
                                <i className="bi bi-search sp-input-icon" />
                                <input
                                    type="text"
                                    className="sp-form-control"
                                    placeholder="Produit, SKU, opérateur..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Type filter */}
                        <div className="col-12 col-md-3">
                            <select
                                className={`sp-form-select`}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={typeFilter === 'in'
                                    ? { borderColor: 'var(--success)', color: 'var(--success)' }
                                    : typeFilter === 'out'
                                    ? { borderColor: 'var(--danger)', color: 'var(--danger)' }
                                    : {}
                                }
                            >
                                <option value="">Tous les types</option>
                                <option value="in">Entrées</option>
                                <option value="out">Sorties</option>
                            </select>
                        </div>

                        {/* Stats chips */}
                        <div className="col-12 col-md-4 d-flex justify-content-md-end align-items-center gap-2 flex-wrap">
                            <span className="sp-badge sp-badge-success">
                                <i className="bi bi-arrow-down-left" />
                                {movements.filter(m => m.type === 'in').length} entrées
                            </span>
                            <span className="sp-badge sp-badge-danger">
                                <i className="bi bi-arrow-up-right" />
                                {movements.filter(m => m.type === 'out').length} sorties
                            </span>
                            {(search || typeFilter || supplierId) && (
                                <button
                                    className="sp-btn sp-btn-secondary sp-btn-sm"
                                    onClick={() => { setSearch(''); setTypeFilter(''); setSupplierId(''); }}
                                >
                                    <i className="bi bi-x-lg" /> RAZ
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
                                <th>Date</th>
                                <th>Produit</th>
                                <th style={{ textAlign: 'center' }}>Type</th>
                                <th style={{ textAlign: 'center' }}>Quantité</th>
                                <th>Raison / Fournisseur</th>
                                <th>Opérateur</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="sp-loading-overlay">
                                            <div className="sp-spinner" />
                                            <span>Chargement des mouvements...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="sp-loading-overlay" style={{ padding: '48px' }}>
                                            <i className="bi bi-inbox" style={{ fontSize: 36, color: 'var(--text-muted)' }} />
                                            <span>Aucun mouvement enregistré</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movements.map(m => {
                                const isIn = m.type === 'in';
                                const date = new Date(m.movement_date);
                                return (
                                    <tr key={m.id}>
                                        {/* Date */}
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                                                {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                                                {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>

                                        {/* Product */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div
                                                    style={{
                                                        width: 34, height: 34,
                                                        borderRadius: 8,
                                                        background: isIn ? 'var(--success-light)' : 'var(--danger-light)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <i
                                                        className="bi bi-box-seam"
                                                        style={{ fontSize: 14, color: isIn ? 'var(--success)' : 'var(--danger)' }}
                                                    />
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/products/${m.product_id}`}
                                                        style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', textDecoration: 'none' }}
                                                    >
                                                        {m.product?.name}
                                                    </Link>
                                                    <div>
                                                        <code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 4 }}>
                                                            {m.product?.sku}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td style={{ textAlign: 'center' }}>
                                            <TypeBadge type={m.type} />
                                        </td>

                                        {/* Quantity */}
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                fontWeight: 900,
                                                fontSize: 18,
                                                color: isIn ? 'var(--success)' : 'var(--danger)',
                                                letterSpacing: '-0.04em',
                                            }}>
                                                {isIn ? '+' : '−'}{m.quantity}
                                            </span>
                                        </td>

                                        {/* Reason / Source / Target */}
                                        <td>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 220 }}>
                                                {m.reason || (isIn ? 'Réception stock' : 'Expédition / Vente')}
                                            </div>
                                            {m.supplier && (
                                                <span className="sp-badge sp-badge-info" style={{ marginTop: 4 }}>
                                                    <i className="bi bi-truck" />
                                                    {m.supplier.name}
                                                </span>
                                            )}
                                            {m.department && (
                                                <span className="sp-badge" style={{ marginTop: 4, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                                                    <i className="bi bi-house-door" />
                                                    {m.department.name}
                                                </span>
                                            )}
                                        </td>

                                        {/* Operator */}
                                        <td>
                                            {m.user?.name ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                    <div style={{
                                                        width: 28, height: 28,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg,var(--primary),var(--primary-light))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
                                                    }}>
                                                        {m.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                        {m.user.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination meta={meta} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default MovementList;
