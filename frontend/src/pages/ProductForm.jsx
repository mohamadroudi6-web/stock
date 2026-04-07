import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ProductForm = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const isEdit       = !!id;

    const [formData, setFormData] = useState({
        sku: '', name: '', description: '',
        category_id: '', unit: 'unité',
        price: 0, min_qty: 5, is_active: true,
    });
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [fetching,   setFetching]   = useState(isEdit);
    const [error,      setError]      = useState('');
    const [success,    setSuccess]    = useState(false);

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data)).catch(console.error);
        if (isEdit) {
            api.get(`/products/${id}`)
                .then(r => setFormData({
                    sku:         r.data.sku,
                    name:        r.data.name,
                    description: r.data.description || '',
                    category_id: r.data.category_id || '',
                    unit:        r.data.unit,
                    price:       r.data.price || 0,
                    min_qty:     r.data.min_qty,
                    is_active:   r.data.is_active,
                }))
                .catch(() => setError('Impossible de charger le produit.'))
                .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess(false);
        try {
            if (isEdit) await api.put(`/products/${id}`, formData);
            else        await api.post('/products', formData);
            setSuccess(true);
            setTimeout(() => navigate('/products'), 800);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement du produit...</span>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="sp-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/products" className="sp-btn sp-btn-secondary sp-btn-icon">
                        <i className="bi bi-arrow-left" />
                    </Link>
                    <div>
                        <h1 className="sp-page-title">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>
                        <p className="sp-page-subtitle">Gestion du catalogue inventaire</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* ── Main fields ── */}
                    <div className="col-12 col-lg-8">
                        <div className="sp-card mb-4">
                            <div className="sp-card-header">
                                <h2 className="sp-card-title">
                                    <i className="bi bi-box-seam-fill" style={{ color: 'var(--primary)' }} />
                                    {' '}Informations générales
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Désignation du produit *</label>
                                    <input
                                        type="text" required className="sp-form-control"
                                        placeholder="ex : Cartouche HP 305 Noir"
                                        value={formData.name}
                                        onChange={e => set('name', e.target.value)}
                                    />
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="sp-form-label">Référence SKU *</label>
                                        <input
                                            type="text" required className="sp-form-control"
                                            placeholder="ex : PRD-001"
                                            value={formData.sku}
                                            onChange={e => set('sku', e.target.value)}
                                            style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="sp-form-label">Catégorie</label>
                                        <select
                                            className="sp-form-select"
                                            value={formData.category_id}
                                            onChange={e => set('category_id', e.target.value)}
                                        >
                                            <option value="">— Sélectionner —</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="sp-form-group" style={{ marginTop: 20 }}>
                                    <label className="sp-form-label">Description</label>
                                    <textarea
                                        className="sp-form-control"
                                        rows="4"
                                        placeholder="Spécifications, dimensions, compatibilité..."
                                        value={formData.description}
                                        onChange={e => set('description', e.target.value)}
                                        style={{ resize: 'vertical', minHeight: 100 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: pricing + save ── */}
                    <div className="col-12 col-lg-4">
                        <div className="sp-card mb-4">
                            <div className="sp-card-header">
                                <h2 className="sp-card-title">
                                    <i className="bi bi-clipboard-data-fill" style={{ color: 'var(--primary)' }} />
                                    {' '}Inventaire & Prix
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Prix unitaire (DH)</label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-currency-dollar sp-input-icon" />
                                        <input type="number" step="0.01" className="sp-form-control"
                                            value={formData.price} onChange={e => set('price', e.target.value)} />
                                    </div>
                                </div>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Unité de mesure *</label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-rulers sp-input-icon" />
                                        <input type="text" required className="sp-form-control"
                                            placeholder="ex : Kg, Unité, Pack"
                                            value={formData.unit} onChange={e => set('unit', e.target.value)} />
                                    </div>
                                </div>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Seuil d'alerte (min) *</label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-exclamation-triangle-fill sp-input-icon" style={{ color: 'var(--warning)' }} />
                                        <input type="number" required className="sp-form-control"
                                            value={formData.min_qty} onChange={e => set('min_qty', e.target.value)} />
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 14px',
                                    background: 'var(--gray-50)',
                                    border: '1.5px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    marginBottom: 20,
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>Produit actif</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visible dans le catalogue</div>
                                    </div>
                                    <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={e => set('is_active', e.target.checked)}
                                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                                        />
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: formData.is_active ? 'var(--primary)' : 'var(--gray-300)',
                                            borderRadius: 12, transition: 'all 0.2s',
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                width: 18, height: 18,
                                                background: 'white',
                                                borderRadius: '50%',
                                                top: 3,
                                                left: formData.is_active ? 23 : 3,
                                                transition: 'all 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            }} />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Error / Success */}
                        {error && (
                            <div className="sp-alert sp-alert-danger mb-3 animate-shake">
                                <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="sp-alert sp-alert-success mb-3">
                                <i className="bi bi-check-circle-fill" style={{ flexShrink: 0 }} />
                                {isEdit ? 'Produit mis à jour !' : 'Produit créé avec succès !'}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            className="sp-btn sp-btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }}
                        >
                            {loading ? (
                                <><div className="sp-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} /> Enregistrement...</>
                            ) : (
                                <><i className={`bi ${isEdit ? 'bi-floppy-fill' : 'bi-plus-circle-fill'}`} /> {isEdit ? 'Mettre à jour' : 'Créer le produit'}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
