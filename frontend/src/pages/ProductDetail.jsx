import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProductDetail = () => {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [product,   setProduct]   = useState(null);
    const [movements, setMovements] = useState([]);
    const [loading,   setLoading]   = useState(true);

    const user    = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.role === 'admin';

    useEffect(() => {
        const load = async () => {
            try {
                const [prod, moves] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/movements?product_id=${id}`),
                ]);
                setProduct(prod.data);
                setMovements(moves.data.data || moves.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
        try {
            await api.delete(`/products/${id}`);
            navigate('/products');
        } catch {
            alert('Erreur lors de la suppression.');
        }
    };

    if (loading) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" />
            <span>Chargement du produit...</span>
        </div>
    );

    if (!product) return (
        <div className="sp-alert sp-alert-danger" style={{ margin: 32 }}>
            <i className="bi bi-exclamation-circle-fill" />
            Produit introuvable.
        </div>
    );

    const isLow   = product.current_stock <= product.min_qty;
    const stockPct = Math.min(Math.round((product.current_stock / Math.max(product.min_qty * 2, 1)) * 100), 100);
    const stockColor = isLow
        ? 'var(--danger)'
        : product.current_stock <= product.min_qty * 1.5
        ? 'var(--warning)'
        : 'var(--success)';

    return (
        <div>
            {/* Header */}
            <div className="sp-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/products" className="sp-btn sp-btn-secondary sp-btn-icon">
                        <i className="bi bi-arrow-left" />
                    </Link>
                    <div>
                        <h1 className="sp-page-title">{product.name}</h1>
                        <p className="sp-page-subtitle">
                            <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>
                                {product.sku}
                            </code>
                            {product.category && (
                                <span className="sp-badge sp-badge-neutral" style={{ marginLeft: 8 }}>
                                    <i className="bi bi-tag-fill" style={{ fontSize: 9 }} />
                                    {product.category.name}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/products/edit/${product.id}`} className="sp-btn sp-btn-secondary" style={{ color: 'var(--warning)' }}>
                            <i className="bi bi-pencil-fill" /> Modifier
                        </Link>
                        <button className="sp-btn sp-btn-danger" onClick={handleDelete}>
                            <i className="bi bi-trash-fill" /> Supprimer
                        </button>
                    </div>
                )}
            </div>

            <div className="row g-4">
                {/* ── Left column: details ── */}
                <div className="col-12 col-xl-8">

                    {/* Stock overview card */}
                    <div className="sp-card mb-4" style={{ overflow: 'hidden' }}>
                        <div style={{
                            background: `linear-gradient(135deg, ${isLow ? '#fee2e2' : '#f0fdf4'}, ${isLow ? '#fecaca' : '#dcfce7'})`,
                            padding: '28px 28px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 32,
                            flexWrap: 'wrap',
                        }}>
                            {/* Stock number */}
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
                                    Stock actuel
                                </div>
                                <div style={{ fontWeight: 900, fontSize: 52, letterSpacing: '-0.05em', color: stockColor, lineHeight: 1 }}>
                                    {product.current_stock}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {product.unit || 'unités'}
                                </div>
                            </div>

                            {/* Progress */}
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div className="sp-stock-bar" style={{ width: '100%', height: 8, marginBottom: 8 }}>
                                    <div className="sp-stock-bar-fill" style={{ width: `${stockPct}%`, background: stockColor }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>Seuil min : <strong>{product.min_qty}</strong></span>
                                    <span className={`sp-badge ${isLow ? 'sp-badge-danger' : 'sp-badge-success'}`}>
                                        <i className={`bi ${isLow ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} />
                                        {isLow ? 'Critique' : 'Suffisant'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick action */}
                            <Link to={`/movements/new`} className="sp-btn sp-btn-primary" style={{ flexShrink: 0 }}>
                                <i className="bi bi-arrow-left-right" />
                                Mouvement
                            </Link>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <h2 className="sp-card-title">
                                <i className="bi bi-info-circle-fill" style={{ color: 'var(--primary)' }} />
                                {' '}Informations produit
                            </h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div className="row g-3">
                                <InfoTile icon="bi-tag-fill"        label="Catégorie"   value={product.category?.name} />
                                <InfoTile icon="bi-currency-dollar" label="Prix unitaire" value={product.price ? `${product.price} DH` : null} />
                                <InfoTile icon="bi-upc-scan"        label="SKU"          value={product.sku} mono />
                                <InfoTile icon="bi-rulers"          label="Unité"        value={product.unit} />
                            </div>

                            {product.description && (
                                <div style={{
                                    marginTop: 20,
                                    padding: '16px',
                                    background: 'var(--gray-50)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius)',
                                }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>
                                        Description
                                    </div>
                                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right column: movement history ── */}
                <div className="col-12 col-xl-4">
                    <div className="sp-card" style={{ position: 'sticky', top: 88 }}>
                        <div className="sp-card-header">
                            <h2 className="sp-card-title">
                                <i className="bi bi-clock-history" style={{ color: 'var(--primary)' }} />
                                {' '}Historique récent
                            </h2>
                            <span className="sp-badge sp-badge-neutral">{movements.length}</span>
                        </div>
                        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                            {movements.length === 0 ? (
                                <div className="sp-loading-overlay" style={{ padding: 40 }}>
                                    <i className="bi bi-inbox" style={{ fontSize: 32, color: 'var(--text-muted)' }} />
                                    <span>Aucun mouvement enregistré</span>
                                </div>
                            ) : movements.slice(0, 20).map(m => {
                                const isIn = m.type === 'in';
                                return (
                                    <div key={m.id} className="sp-list-item" style={{ padding: '12px 24px' }}>
                                        <div className="sp-movement-icon" style={{
                                            background: isIn ? 'var(--success-light)' : 'var(--danger-light)',
                                            width: 34, height: 34,
                                        }}>
                                            <i className={`bi ${isIn ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}
                                               style={{ color: isIn ? 'var(--success)' : 'var(--danger)', fontSize: 14 }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                                                {isIn ? 'Réception' : 'Expédition'}
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                                                {new Date(m.movement_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 800, fontSize: 15,
                                            color: isIn ? 'var(--success)' : 'var(--danger)',
                                        }}>
                                            {isIn ? '+' : '−'}{m.quantity}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)' }}>
                            <Link to={`/movements?product_id=${product.id}`} className="sp-btn sp-btn-secondary sp-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                                Voir tout l'historique <i className="bi bi-arrow-right" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Info tile ── */
const InfoTile = ({ icon, label, value, mono }) => (
    <div className="col-12 col-sm-6">
        <div style={{
            padding: '14px 16px',
            background: 'var(--gray-50)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)',
        }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className={`bi ${icon}`} style={{ fontSize: 11 }} />
                {label}
            </div>
            {mono
                ? <code style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', background: 'var(--gray-200)', padding: '2px 8px', borderRadius: 4 }}>{value || '—'}</code>
                : <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{value || '—'}</div>
            }
        </div>
    </div>
);

export default ProductDetail;
