import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SupplierDashboard = () => {
    const [supplierData, setSupplierData] = useState(null);
    const [movements,    setMovements]    = useState([]);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [meRes, moveRes] = await Promise.all([
                    api.get('/supplier/me'),
                    api.get('/supplier/movements'),
                ]);
                setSupplierData(meRes.data.supplier);
                setMovements(moveRes.data.data || moveRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement de votre espace partenaire...</span>
        </div>
    );

    const initials = (supplierData?.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div>
            {/* Hero banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e1b4b 100%)',
                borderRadius: 'var(--border-radius-xl)',
                padding: '36px 40px',
                marginBottom: 28,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.15)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 20, right: 160, fontSize: 120, opacity: 0.04, pointerEvents: 'none', lineHeight: 1 }}>🚚</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    {/* Avatar */}
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: 'linear-gradient(135deg,rgba(79,70,229,0.5),rgba(99,102,241,0.3))',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 28, color: 'white', flexShrink: 0,
                    }}>
                        {initials}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                            Portail Partenaire
                        </div>
                        <h1 style={{ fontWeight: 900, fontSize: 28, color: 'white', letterSpacing: '-0.04em', margin: '0 0 8px' }}>
                            {supplierData?.name}
                        </h1>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            fontSize: 12, fontWeight: 600, color: '#34d399',
                            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                            padding: '4px 12px', borderRadius: 20,
                        }}>
                            <i className="bi bi-patch-check-fill" />
                            Partenaire certifié
                        </span>
                    </div>
                </div>

                {/* Contact strips */}
                <div className="row g-3" style={{ marginTop: 28, position: 'relative', zIndex: 1 }}>
                    {[
                        { icon: 'bi-envelope-fill', label: 'Email', value: supplierData?.email },
                        { icon: 'bi-telephone-fill', label: 'Téléphone', value: supplierData?.phone },
                        { icon: 'bi-geo-alt-fill', label: 'Localisation', value: supplierData?.city },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="col-12 col-md-4">
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 12,
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: 'rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <i className={`bi ${icon}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{label}</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{value || '—'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats chips */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="sp-stat-card">
                        <div className="sp-stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <i className="bi bi-truck-front-fill" style={{ fontSize: 20, color: 'var(--success)' }} />
                        </div>
                        <div className="sp-stat-label">Livraisons totales</div>
                        <div className="sp-stat-value">{String(movements.length).padStart(3, '0')}</div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="sp-stat-card">
                        <div className="sp-stat-icon" style={{ background: 'rgba(79,70,229,0.1)' }}>
                            <i className="bi bi-boxes" style={{ fontSize: 20, color: 'var(--primary)' }} />
                        </div>
                        <div className="sp-stat-label">Unités livrées</div>
                        <div className="sp-stat-value">{String(movements.reduce((s, m) => s + (m.quantity || 0), 0)).padStart(3, '0')}</div>
                    </div>
                </div>
            </div>

            {/* Deliveries table */}
            <div className="sp-card">
                <div className="sp-card-header">
                    <h2 className="sp-card-title">
                        <i className="bi bi-clock-history" style={{ color: 'var(--primary)' }} />
                        {' '}Suivi de vos livraisons
                    </h2>
                    <span className="sp-badge sp-badge-neutral">{movements.length} opération{movements.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="sp-table-wrapper">
                    <table className="sp-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Produit livré</th>
                                <th style={{ textAlign: 'center' }}>Quantité</th>
                                <th>Référence SKU</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <div className="sp-loading-overlay" style={{ padding: 48 }}>
                                            <i className="bi bi-inbox" style={{ fontSize: 36, color: 'var(--text-muted)' }} />
                                            <span>Aucune livraison enregistrée</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movements.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                                            {new Date(m.movement_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{m.product?.name}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="sp-badge sp-badge-success">
                                            <i className="bi bi-arrow-down-left" />
                                            +{m.quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 4 }}>
                                            {m.product?.sku}
                                        </code>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
