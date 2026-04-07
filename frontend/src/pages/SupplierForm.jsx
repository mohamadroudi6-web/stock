import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

const SupplierForm = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const isEdit    = !!id;

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        address: '', city: '', country: 'Maroc',
    });
    const [loading,  setLoading]  = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState(false);

    const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

    useEffect(() => {
        if (isEdit) {
            api.get(`/suppliers/${id}`)
               .then(r => setFormData(r.data))
               .catch(() => setError('Fournisseur introuvable.'))
               .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess(false);
        try {
            if (isEdit) await api.put(`/suppliers/${id}`, formData);
            else        await api.post('/suppliers', formData);
            setSuccess(true);
            setTimeout(() => navigate('/suppliers'), 700);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement du fournisseur...</span>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="sp-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/suppliers" className="sp-btn sp-btn-secondary sp-btn-icon">
                        <i className="bi bi-arrow-left" />
                    </Link>
                    <div>
                        <h1 className="sp-page-title">{isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h1>
                        <p className="sp-page-subtitle">Gestion de la chaîne d'approvisionnement</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* ── Identity ── */}
                    <div className="col-12 col-lg-7">
                        <div className="sp-card">
                            <div className="sp-card-header">
                                <h2 className="sp-card-title">
                                    <i className="bi bi-building" style={{ color: 'var(--primary)' }} />
                                    {' '}Identité de l'entreprise
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Raison sociale / Nom *</label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-building sp-input-icon" />
                                        <input type="text" required className="sp-form-control"
                                            placeholder="Nom de l'entreprise fournisseur"
                                            value={formData.name} onChange={e => set('name', e.target.value)} />
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="sp-form-label">E-mail *</label>
                                        <div className="sp-input-group">
                                            <i className="bi bi-envelope-fill sp-input-icon" />
                                            <input type="email" required className="sp-form-control"
                                                placeholder="contact@fournisseur.com"
                                                value={formData.email} onChange={e => set('email', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="sp-form-label">Téléphone *</label>
                                        <div className="sp-input-group">
                                            <i className="bi bi-telephone-fill sp-input-icon" />
                                            <input type="text" required className="sp-form-control"
                                                placeholder="+212 6 XX XX XX XX"
                                                value={formData.phone} onChange={e => set('phone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Location ── */}
                    <div className="col-12 col-lg-5">
                        <div className="sp-card h-100">
                            <div className="sp-card-header">
                                <h2 className="sp-card-title">
                                    <i className="bi bi-geo-alt-fill" style={{ color: 'var(--info)' }} />
                                    {' '}Localisation
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Adresse</label>
                                    <textarea className="sp-form-control" rows="3"
                                        placeholder="Adresse complète du siège..."
                                        value={formData.address} onChange={e => set('address', e.target.value)}
                                        style={{ resize: 'none' }} />
                                </div>
                                <div className="row g-3">
                                    <div className="col-7">
                                        <label className="sp-form-label">Ville *</label>
                                        <div className="sp-input-group">
                                            <i className="bi bi-geo-alt sp-input-icon" />
                                            <input type="text" required className="sp-form-control"
                                                placeholder="Casablanca"
                                                value={formData.city} onChange={e => set('city', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-5">
                                        <label className="sp-form-label">Pays</label>
                                        <input type="text" className="sp-form-control"
                                            value={formData.country} onChange={e => set('country', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <div className="col-12">
                        {error && (
                            <div className="sp-alert sp-alert-danger mb-3 animate-shake">
                                <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="sp-alert sp-alert-success mb-3">
                                <i className="bi bi-check-circle-fill" style={{ flexShrink: 0 }} />
                                {isEdit ? 'Fournisseur mis à jour !' : 'Fournisseur créé avec succès !'}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <Link to="/suppliers" className="sp-btn sp-btn-secondary">
                                <i className="bi bi-x-lg" /> Annuler
                            </Link>
                            <button type="submit" disabled={loading} className="sp-btn sp-btn-primary" style={{ minWidth: 180, justifyContent: 'center' }}>
                                {loading ? (
                                    <><div className="sp-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} /> Enregistrement...</>
                                ) : (
                                    <><i className={`bi ${isEdit ? 'bi-floppy-fill' : 'bi-handshake'}`} /> {isEdit ? 'Mettre à jour' : 'Créer le partenariat'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SupplierForm;
