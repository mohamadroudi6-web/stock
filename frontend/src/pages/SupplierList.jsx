import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Pagination from '../components/Pagination';

/* ── Supplier Card ── */
const SupplierCard = ({ s }) => {
    const initials = s.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors   = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];
    const color    = colors[s.id % colors.length];

    return (
        <div className="col-12 col-md-6 col-xl-4">
            <div className="sp-card h-100 animate-fade-in-up" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
            >
                {/* Card header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                        border: `1.5px solid ${color}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 16, color,
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <i className="bi bi-geo-alt-fill" style={{ fontSize: 10 }} />
                            {s.city || 'N/A'}, {s.country || 'Maroc'}
                        </div>
                    </div>
                    <Link
                        to={`/suppliers/edit/${s.id}`}
                        className="sp-btn sp-btn-secondary sp-btn-icon sp-btn-sm"
                        title="Modifier"
                        style={{ flexShrink: 0 }}
                    >
                        <i className="bi bi-pencil-fill" />
                    </Link>
                </div>

                {/* Contact info */}
                <div style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                            <i className="bi bi-envelope-fill" style={{ fontSize: 13, color: 'var(--primary)', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.email || 'Non renseigné'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                            <i className="bi bi-telephone-fill" style={{ fontSize: 13, color: 'var(--success)', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                {s.phone || 'Non renseigné'}
                            </span>
                        </div>
                    </div>

                    <Link
                        to={`/movements?supplier_id=${s.id}`}
                        className="sp-btn sp-btn-secondary sp-btn-sm"
                        style={{ width: '100%', justifyContent: 'center', color }}
                    >
                        <i className="bi bi-clock-history" />
                        Historique livraisons
                    </Link>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════
   SupplierList Page
═════════════════════════════════════ */
const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [meta,      setMeta]      = useState({ current_page: 1, last_page: 1, total: 0 });
    const [search,    setSearch]    = useState('');
    const [loading,   setLoading]   = useState(true);
    const [page,      setPage]      = useState(1);

    const fetchSuppliers = useCallback(async (pg = 1, q = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/suppliers?page=${pg}&search=${q}`);
            setSuppliers(res.data.data);
            setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total, from: res.data.from, to: res.data.to });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { fetchSuppliers(1, search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search, fetchSuppliers]);

    const handlePageChange = (p) => { setPage(p); fetchSuppliers(p, search); };

    return (
        <div>
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">Partenaires Fournisseurs</h1>
                    <p className="sp-page-subtitle">{meta.total} fournisseur{meta.total !== 1 ? 's' : ''} enregistré{meta.total !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/suppliers/new" className="sp-btn sp-btn-primary">
                    <i className="bi bi-plus-lg" /> Ajouter un fournisseur
                </Link>
            </div>

            {/* Search */}
            <div className="sp-card mb-4">
                <div style={{ padding: '16px 24px' }}>
                    <div className="sp-input-group" style={{ maxWidth: 400 }}>
                        <i className="bi bi-search sp-input-icon" />
                        <input
                            type="text" className="sp-form-control"
                            placeholder="Rechercher par nom, ville, email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Cards grid */}
            {loading ? (
                <div className="sp-loading-overlay" style={{ minHeight: 300 }}>
                    <div className="sp-spinner" /><span>Chargement des fournisseurs...</span>
                </div>
            ) : suppliers.length === 0 ? (
                <div className="sp-loading-overlay" style={{ minHeight: 300 }}>
                    <i className="bi bi-truck" style={{ fontSize: 40, color: 'var(--text-muted)' }} />
                    <span>Aucun fournisseur trouvé</span>
                </div>
            ) : (
                <div className="row g-4 mb-4">
                    {suppliers.map(s => <SupplierCard key={s.id} s={s} />)}
                </div>
            )}

            {/* Pagination */}
            {!loading && suppliers.length > 0 && (
                <div className="sp-card">
                    <Pagination meta={meta} onPageChange={handlePageChange} />
                </div>
            )}
        </div>
    );
};

export default SupplierList;
