import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

/* ════════════════════════════════════
   MovementForm Page
═════════════════════════════════════ */
const MovementForm = () => {
    const navigate = useNavigate();
    const [products,    setProducts]    = useState([]);
    const [suppliers,   setSuppliers]   = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState('');

    const [formData, setFormData] = useState({
        product_id:    '',
        type:          'in',
        quantity:       1,
        reason:        '',
        supplier_id:   '',
        department_id: '',
        movement_date: new Date().toISOString().split('T')[0],
    });

    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data.data || res.data));
        api.get('/suppliers').then(res => setSuppliers(res.data.data || res.data));
        api.get('/departments').then(res => setDepartments(res.data.data || res.data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'product_id') {
            setSelectedProduct(products.find(p => p.id === parseInt(value)) || null);
        }
    };

    const setType = (t) => setFormData(prev => ({ ...prev, type: t }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.type === 'out' && selectedProduct && parseInt(formData.quantity) > selectedProduct.current_stock) {
            setError('Stock insuffisant pour cette sortie !');
            return;
        }

        setLoading(true);
        try {
            // Clean data before submission
            const submitData = { ...formData };
            if (submitData.type === 'in') {
                submitData.department_id = null;
            } else {
                submitData.supplier_id = null;
            }

            await api.post('/movements', submitData);
            navigate('/movements');
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    const isIn  = formData.type === 'in';
    const accent = isIn ? 'var(--success)' : 'var(--danger)';
    const accentBg = isIn ? 'var(--success-light)' : 'var(--danger-light)';

    /* Stock percentage for the info panel */
    const stockPct = selectedProduct
        ? Math.min(Math.round((selectedProduct.current_stock / Math.max(selectedProduct.min_qty * 2, 1)) * 100), 100)
        : 0;
    const insufficientStock =
        formData.type === 'out' && selectedProduct && parseInt(formData.quantity) > selectedProduct.current_stock;

    return (
        <div>
            {/* Page header */}
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">Opération de Stock</h1>
                    <p className="sp-page-subtitle">Enregistrer une entrée ou une sortie de marchandises</p>
                </div>
                <button
                    className="sp-btn sp-btn-secondary"
                    onClick={() => navigate('/movements')}
                >
                    <i className="bi bi-arrow-left" /> Retour
                </button>
            </div>

            <div className="row g-4">

                {/* ── Main form ── */}
                <div className="col-12 col-xl-8">
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <h2 className="sp-card-title">
                                <i className={`bi ${isIn ? 'bi-arrow-down-left-circle-fill' : 'bi-arrow-up-right-circle-fill'}`}
                                   style={{ color: accent }} />
                                {' '}Nouveau mouvement
                            </h2>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <form onSubmit={handleSubmit}>

                                {/* Type selector */}
                                <div style={{ marginBottom: 28 }}>
                                    <label className="sp-form-label">Type d'opération</label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 12,
                                    }}>
                                        {/* Entrée */}
                                        <button
                                            type="button"
                                            onClick={() => setType('in')}
                                            style={{
                                                padding: '16px',
                                                borderRadius: 'var(--border-radius)',
                                                border: `2px solid ${formData.type === 'in' ? 'var(--success)' : 'var(--border-color)'}`,
                                                background: formData.type === 'in' ? 'var(--success-light)' : 'var(--bg-input)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                            }}
                                        >
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10,
                                                background: formData.type === 'in' ? 'var(--success)' : 'var(--gray-200)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}>
                                                <i className="bi bi-arrow-down-left" style={{ fontSize: 18, color: formData.type === 'in' ? 'white' : 'var(--text-muted)' }} />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: formData.type === 'in' ? 'var(--success-dark)' : 'var(--text-primary)' }}>
                                                    Entrée
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Réception de stock</div>
                                            </div>
                                        </button>

                                        {/* Sortie */}
                                        <button
                                            type="button"
                                            onClick={() => setType('out')}
                                            style={{
                                                padding: '16px',
                                                borderRadius: 'var(--border-radius)',
                                                border: `2px solid ${formData.type === 'out' ? 'var(--danger)' : 'var(--border-color)'}`,
                                                background: formData.type === 'out' ? 'var(--danger-light)' : 'var(--bg-input)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                            }}
                                        >
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10,
                                                background: formData.type === 'out' ? 'var(--danger)' : 'var(--gray-200)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}>
                                                <i className="bi bi-arrow-up-right" style={{ fontSize: 18, color: formData.type === 'out' ? 'white' : 'var(--text-muted)' }} />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: formData.type === 'out' ? 'var(--danger-dark)' : 'var(--text-primary)' }}>
                                                    Sortie
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expédition de stock</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Product select */}
                                <div className="sp-form-group">
                                    <label className="sp-form-label">
                                        <i className="bi bi-box-seam me-1" />
                                        Produit *
                                    </label>
                                    <select
                                        name="product_id"
                                        required
                                        className="sp-form-select"
                                        value={formData.product_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">— Choisir un produit —</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.sku}) · Stock: {p.current_stock}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity + Date */}
                                <div className="row g-3" style={{ marginBottom: 20 }}>
                                    <div className="col-6">
                                        <label className="sp-form-label">
                                            <i className="bi bi-hash me-1" />
                                            Quantité *
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            required
                                            min="1"
                                            className="sp-form-control"
                                            style={insufficientStock ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' } : {}}
                                            value={formData.quantity}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="sp-form-label">
                                            <i className="bi bi-calendar3 me-1" />
                                            Date opération *
                                        </label>
                                        <input
                                            type="date"
                                            name="movement_date"
                                            required
                                            className="sp-form-control"
                                            value={formData.movement_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {isIn ? (
                                    <div className="sp-form-group">
                                        <label className="sp-form-label">
                                            <i className="bi bi-truck me-1" />
                                            Fournisseur
                                        </label>
                                        <select
                                            name="supplier_id"
                                            className="sp-form-select"
                                            value={formData.supplier_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Non spécifié</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="sp-form-group">
                                        <label className="sp-form-label text-danger">
                                            <i className="bi bi-diagram-3 me-1" />
                                            Département destinataire *
                                        </label>
                                        <select
                                            name="department_id"
                                            className="sp-form-select"
                                            style={{ borderColor: 'var(--danger-light)' }}
                                            required={!isIn}
                                            value={formData.department_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">— Choisir le département destinataire —</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Reason */}
                                <div className="sp-form-group">
                                    <label className="sp-form-label">
                                        <i className="bi bi-chat-left-text me-1" />
                                        Raison / Note
                                    </label>
                                    <textarea
                                        name="reason"
                                        rows="3"
                                        className="sp-form-control"
                                        placeholder={isIn ? 'Ex : Réapprovisionnement mensuel...' : 'Ex : Commande client #1234...'}
                                        value={formData.reason}
                                        onChange={handleChange}
                                        style={{ resize: 'vertical', minHeight: 88 }}
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="sp-alert sp-alert-danger animate-shake" style={{ marginBottom: 20 }}>
                                        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: 16, flexShrink: 0 }} />
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || insufficientStock}
                                    className="sp-btn"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        padding: '13px',
                                        fontSize: 14,
                                        background: `linear-gradient(135deg, ${accent}, ${isIn ? '#34d399' : '#f87171'})`,
                                        color: 'white',
                                        boxShadow: `0 8px 20px -4px ${isIn ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                        borderRadius: 'var(--border-radius)',
                                        border: 'none',
                                        opacity: (loading || insufficientStock) ? 0.7 : 1,
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="sp-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <i className={`bi ${isIn ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'}`} />
                                            Valider l'opération
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Info Panel ── */}
                <div className="col-12 col-xl-4">
                    <div className="sp-card" style={{ position: 'sticky', top: 88 }}>
                        <div className="sp-card-header">
                            <h2 className="sp-card-title">
                                <i className="bi bi-info-circle-fill" style={{ color: 'var(--info)' }} />
                                {' '}Détail produit
                            </h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {selectedProduct ? (
                                <div>
                                    {/* Product name */}
                                    <div style={{
                                        padding: '16px',
                                        background: 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)',
                                        marginBottom: 16,
                                        border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>
                                            Produit sélectionné
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                                            {selectedProduct.name}
                                        </div>
                                        <code style={{ fontSize: 11.5, color: 'var(--text-muted)', background: 'var(--gray-200)', padding: '2px 8px', borderRadius: 4 }}>
                                            {selectedProduct.sku}
                                        </code>
                                    </div>

                                    {/* Stock status */}
                                    <div style={{
                                        padding: '16px',
                                        background: insufficientStock ? 'var(--danger-light)' : 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)',
                                        border: `1px solid ${insufficientStock ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                                        marginBottom: 16,
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>
                                            Stock actuel
                                        </div>
                                        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: insufficientStock ? 'var(--danger)' : 'var(--text-primary)' }}>
                                            {selectedProduct.current_stock}
                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>unités</span>
                                        </div>
                                        <div className="sp-stock-bar" style={{ width: '100%', marginTop: 10, height: 6 }}>
                                            <div
                                                className="sp-stock-bar-fill"
                                                style={{
                                                    width: `${stockPct}%`,
                                                    background: insufficientStock
                                                        ? 'var(--danger)'
                                                        : stockPct < 40
                                                        ? 'var(--warning)'
                                                        : 'var(--success)',
                                                }}
                                            />
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                            Seuil minimum : <strong>{selectedProduct.min_qty}</strong> unités
                                        </div>
                                    </div>

                                    {/* After operation preview */}
                                    {formData.quantity > 0 && (
                                        <div style={{
                                            padding: '12px 16px',
                                            background: isIn ? 'var(--success-light)' : 'var(--danger-light)',
                                            borderRadius: 'var(--border-radius)',
                                            border: `1px solid ${isIn ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                        }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                Après opération
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: 20, color: isIn ? 'var(--success-dark)' : 'var(--danger-dark)' }}>
                                                {isIn
                                                    ? selectedProduct.current_stock + parseInt(formData.quantity || 0)
                                                    : Math.max(0, selectedProduct.current_stock - parseInt(formData.quantity || 0))
                                                } unités
                                            </div>
                                        </div>
                                    )}

                                    {/* Insufficient warning */}
                                    {insufficientStock && (
                                        <div className="sp-alert sp-alert-danger animate-shake" style={{ marginTop: 12 }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ flexShrink: 0 }} />
                                            <span>Quantité demandée supérieure au stock disponible !</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                    <i className="bi bi-box-seam" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.3 }} />
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                                        Sélectionnez un produit pour voir son état
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovementForm;
