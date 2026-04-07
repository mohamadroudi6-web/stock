import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

const CategoryForm = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const isEdit    = !!id;

    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState(false);

    useEffect(() => {
        if (isEdit) {
            api.get(`/categories/${id}`)
               .then(r => setFormData({ name: r.data.name, description: r.data.description || '' }))
               .catch(() => setError('Catégorie introuvable.'));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess(false);
        try {
            if (isEdit) await api.put(`/categories/${id}`, formData);
            else        await api.post('/categories', formData);
            setSuccess(true);
            setTimeout(() => navigate('/categories'), 700);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de sauvegarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="sp-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/categories" className="sp-btn sp-btn-secondary sp-btn-icon">
                        <i className="bi bi-arrow-left" />
                    </Link>
                    <div>
                        <h1 className="sp-page-title">{isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
                        <p className="sp-page-subtitle">Classification des produits de l'inventaire</p>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-xl-6">
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <h2 className="sp-card-title">
                                <i className="bi bi-tags-fill" style={{ color: 'var(--primary)' }} />
                                {' '}Informations de la catégorie
                            </h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">
                                        <i className="bi bi-tag-fill me-1" />
                                        Nom de la catégorie *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="sp-form-control"
                                        placeholder="Ex : Électronique, Textile, Consommables..."
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="sp-form-group">
                                    <label className="sp-form-label">
                                        <i className="bi bi-chat-left-text me-1" />
                                        Description
                                        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: 'var(--text-muted)' }}>(optionnel)</span>
                                    </label>
                                    <textarea
                                        className="sp-form-control"
                                        rows="4"
                                        placeholder="Description détaillée de cette catégorie de produits..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{ resize: 'vertical', minHeight: 100 }}
                                    />
                                </div>

                                {/* Preview */}
                                {formData.name && (
                                    <div style={{
                                        padding: '14px 16px',
                                        background: 'rgba(79,70,229,0.05)',
                                        border: '1.5px dashed rgba(79,70,229,0.2)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        marginBottom: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: 'rgba(79,70,229,0.1)',
                                            border: '1px solid rgba(79,70,229,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <i className="bi bi-tags-fill" style={{ color: 'var(--primary)', fontSize: 18 }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 2 }}>Aperçu</div>
                                            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{formData.name}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Error / Success */}
                                {error && (
                                    <div className="sp-alert sp-alert-danger mb-4 animate-shake">
                                        <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="sp-alert sp-alert-success mb-4">
                                        <i className="bi bi-check-circle-fill" style={{ flexShrink: 0 }} />
                                        {isEdit ? 'Catégorie mise à jour !' : 'Catégorie créée avec succès !'}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Link to="/categories" className="sp-btn sp-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit" disabled={loading}
                                        className="sp-btn sp-btn-primary"
                                        style={{ flex: 2, justifyContent: 'center', padding: '10px' }}
                                    >
                                        {loading ? (
                                            <><div className="sp-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} /> Enregistrement...</>
                                        ) : (
                                            <><i className={`bi ${isEdit ? 'bi-floppy-fill' : 'bi-plus-circle-fill'}`} /> {isEdit ? 'Mettre à jour' : 'Créer la catégorie'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;
