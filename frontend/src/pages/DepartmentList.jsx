import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/* Palette for departments */
const COLORS = [
    { bg: '#f0f9ff', text: '#0369a1', border: '#7dd3fc' },
    { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
    { bg: '#fdf2f8', text: '#be185d', border: '#f9a8d4' },
];

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading,     setLoading]     = useState(true);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce département ?')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur de suppression.');
        }
    };

    if (loading) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement des départements...</span>
        </div>
    );

    return (
        <div>
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">Départements</h1>
                    <p className="sp-page-subtitle">{departments.length} département{departments.length !== 1 ? 's' : ''} · Unités internes consommatrices</p>
                </div>
                <Link to="/departments/new" className="sp-btn sp-btn-primary">
                    <i className="bi bi-plus-lg" /> Nouveau département
                </Link>
            </div>

            {departments.length === 0 ? (
                <div className="sp-card">
                    <div className="sp-loading-overlay" style={{ padding: 60 }}>
                        <i className="bi bi-diagram-3" style={{ fontSize: 40, color: 'var(--text-muted)' }} />
                        <span>Aucun département créé</span>
                        <Link to="/departments/new" className="sp-btn sp-btn-primary">
                            <i className="bi bi-plus-lg" /> Créer le premier département
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-4 animate-stagger">
                    {departments.map((d, i) => {
                        const pal = COLORS[i % COLORS.length];
                        return (
                            <div key={d.id} className="col-12 col-md-6 col-xl-4">
                                <div className="sp-card h-100">
                                    <div style={{ height: 4, background: pal.border, borderRadius: '12px 12px 0 0' }} />
                                    <div style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 12,
                                                background: pal.bg, border: `1.5px solid ${pal.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <i className="bi bi-house-door-fill" style={{ fontSize: 20, color: pal.text }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link to={`/departments/edit/${d.id}`} className="sp-btn sp-btn-secondary sp-btn-icon sp-btn-sm" title="Modifier">
                                                    <i className="bi bi-pencil-fill" />
                                                </Link>
                                                <button onClick={() => handleDelete(d.id)} className="sp-btn sp-btn-danger sp-btn-icon sp-btn-sm" title="Supprimer">
                                                    <i className="bi bi-trash-fill" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                                            {d.name}
                                        </h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                                            {d.description || 'Aucune description'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DepartmentList;
