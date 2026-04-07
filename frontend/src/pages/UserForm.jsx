import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

/* Role descriptions */
const ROLES = [
    { value: 'admin',       label: 'Administrateur',   icon: 'bi-shield-fill-check', color: '#ef4444', desc: 'Accès complet à toutes les fonctionnalités' },
    { value: 'storekeeper', label: 'Magasinier',        icon: 'bi-box-seam-fill',     color: '#3b82f6', desc: 'Gestion des produits et mouvements' },
    { value: 'supplier',    label: 'Fournisseur',       icon: 'bi-truck-front-fill',  color: '#10b981', desc: 'Portail partenaire — accès limité' },
];

const UserForm = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const isEdit    = !!id;

    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        role: 'storekeeper', supplier_id: '', is_active: true,
    });
    const [suppliers, setSuppliers] = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [fetching,  setFetching]  = useState(isEdit);
    const [error,     setError]     = useState('');
    const [success,   setSuccess]   = useState(false);
    const [showPwd,   setShowPwd]   = useState(false);

    const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

    useEffect(() => {
        api.get('/suppliers?per_page=999')
           .then(r => setSuppliers(r.data.data || r.data))
           .catch(console.error);

        if (isEdit) {
            api.get(`/users/${id}`)
               .then(r => setFormData({
                   name: r.data.name, email: r.data.email, password: '',
                   role: r.data.role, supplier_id: r.data.supplier_id || '',
                   is_active: r.data.is_active,
               }))
               .catch(() => setError('Utilisateur introuvable.'))
               .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess(false);
        try {
            if (isEdit) await api.put(`/users/${id}`, formData);
            else        await api.post('/users', formData);
            setSuccess(true);
            setTimeout(() => navigate('/users'), 700);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement de l'utilisateur...</span>
        </div>
    );

    const selectedRole = ROLES.find(r => r.value === formData.role);

    return (
        <div>
            {/* Header */}
            <div className="sp-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/users" className="sp-btn sp-btn-secondary sp-btn-icon">
                        <i className="bi bi-arrow-left" />
                    </Link>
                    <div>
                        <h1 className="sp-page-title">{isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h1>
                        <p className="sp-page-subtitle">Gestion des accès et des privilèges système</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">

                    {/* ── Identity fields ── */}
                    <div className="col-12 col-lg-8">
                        <div className="sp-card mb-4">
                            <div className="sp-card-header">
                                <h2 className="sp-card-title">
                                    <i className="bi bi-person-fill" style={{ color: 'var(--primary)' }} />
                                    {' '}Informations de l'utilisateur
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div className="sp-form-group">
                                    <label className="sp-form-label">Nom complet *</label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-person sp-input-icon" />
                                        <input type="text" required className="sp-form-control"
                                            placeholder="Prénom NOM"
                                            value={formData.name} onChange={e => set('name', e.target.value)} />
                                    </div>
                                </div>

                                <div className="sp-form-group">
                                    <label className="sp-form-label">Adresse e-mail *</label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-envelope sp-input-icon" />
                                        <input type="email" required className="sp-form-control"
                                            placeholder="utilisateur@stocks-pro.com"
                                            value={formData.email} onChange={e => set('email', e.target.value)} />
                                    </div>
                                </div>

                                <div className="sp-form-group" style={{ marginBottom: 0 }}>
                                    <label className="sp-form-label">
                                        Mot de passe{isEdit && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: 'var(--text-muted)' }}>(laisser vide = inchangé)</span>}
                                        {!isEdit && ' *'}
                                    </label>
                                    <div className="sp-input-group">
                                        <i className="bi bi-lock sp-input-icon" />
                                        <input
                                            type={showPwd ? 'text' : 'password'}
                                            required={!isEdit}
                                            className="sp-form-control"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => set('password', e.target.value)}
                                            style={{ paddingRight: 44 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd(v => !v)}
                                            style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 15, zIndex: 2 }}
                                            tabIndex={-1}
                                        >
                                            <i className={`bi ${showPwd ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Role + Status ── */}
                    <div className="col-12 col-lg-4">
                        <div className="sp-card mb-4">
                            <div className="sp-card-header">
                                <h2 className="sp-card-title">
                                    <i className="bi bi-shield-fill" style={{ color: 'var(--primary)' }} />
                                    {' '}Rôle & Accès
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                {/* Role selector */}
                                <label className="sp-form-label" style={{ marginBottom: 12 }}>Rôle système *</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                    {ROLES.map(r => (
                                        <label key={r.value} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 14px',
                                            borderRadius: 'var(--border-radius-sm)',
                                            border: `1.5px solid ${formData.role === r.value ? r.color + '60' : 'var(--border-color)'}`,
                                            background: formData.role === r.value ? r.color + '12' : 'var(--bg-input)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}>
                                            <input type="radio" name="role" value={r.value}
                                                checked={formData.role === r.value}
                                                onChange={() => set('role', r.value)}
                                                style={{ accentColor: r.color, width: 15, height: 15 }} />
                                            <i className={`bi ${r.icon}`} style={{ fontSize: 16, color: r.color, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 13.5, color: formData.role === r.value ? r.color : 'var(--text-primary)' }}>{r.label}</div>
                                                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Supplier link (if role = supplier) */}
                                {formData.role === 'supplier' && (
                                    <div className="sp-form-group animate-fade-in">
                                        <label className="sp-form-label">Lier au fournisseur *</label>
                                        <select
                                            required
                                            className="sp-form-select"
                                            value={formData.supplier_id}
                                            onChange={e => set('supplier_id', e.target.value)}
                                        >
                                            <option value="">— Sélectionner —</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Active toggle */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: 'var(--gray-50)',
                                    border: '1.5px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius-sm)',
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>Compte actif</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>L'utilisateur peut se connecter</div>
                                    </div>
                                    <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                                        <input type="checkbox" checked={formData.is_active}
                                            onChange={e => set('is_active', e.target.checked)}
                                            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }} />
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: formData.is_active ? 'var(--primary)' : 'var(--gray-300)',
                                            borderRadius: 12, transition: 'all 0.2s',
                                        }}>
                                            <div style={{
                                                position: 'absolute', width: 18, height: 18,
                                                background: 'white', borderRadius: '50%',
                                                top: 3, left: formData.is_active ? 23 : 3,
                                                transition: 'all 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            }} />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Submit row ── */}
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
                                {isEdit ? 'Utilisateur mis à jour !' : 'Utilisateur créé avec succès !'}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <Link to="/users" className="sp-btn sp-btn-secondary">
                                <i className="bi bi-x-lg" /> Annuler
                            </Link>
                            <button type="submit" disabled={loading} className="sp-btn sp-btn-primary" style={{ minWidth: 200, justifyContent: 'center' }}>
                                {loading ? (
                                    <><div className="sp-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} /> Enregistrement...</>
                                ) : (
                                    <><i className={`bi ${isEdit ? 'bi-floppy-fill' : 'bi-person-plus-fill'}`} /> {isEdit ? 'Mettre à jour' : 'Créer l\'accès'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
