import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/* Palette of colors for categories */
const COLORS = [
    { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
    { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    { bg: '#fce7f3', text: '#831843', border: '#f9a8d4' },
    { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' },
];

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette catégorie ?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur de suppression.');
        }
    };

    if (loading) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement des catégories...</span>
        </div>
    );

    return (
        <div>
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">Catégories</h1>
                    <p className="sp-page-subtitle">{categories.length} catégorie{categories.length !== 1 ? 's' : ''} · Classification des produits</p>
                </div>
                <Link to="/categories/new" className="sp-btn sp-btn-primary">
                    <i className="bi bi-plus-lg" /> Nouvelle catégorie
                </Link>
            </div>

            {categories.length === 0 ? (
                <div className="sp-card">
                    <div className="sp-loading-overlay" style={{ padding: 60 }}>
                        <i className="bi bi-tags" style={{ fontSize: 40, color: 'var(--text-muted)' }} />
                        <span>Aucune catégorie créée</span>
                        <Link to="/categories/new" className="sp-btn sp-btn-primary">
                            <i className="bi bi-plus-lg" /> Créer la première catégorie
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-4 animate-stagger">
                    {categories.map((c, i) => {
                        const pal = COLORS[i % COLORS.length];
                        return (
                            <div key={c.id} className="col-12 col-md-6 col-xl-4">
                                <div className="sp-card h-100" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
                                >
                                    {/* Color strip */}
                                    <div style={{ height: 4, background: pal.border, borderRadius: '12px 12px 0 0' }} />

                                    <div style={{ padding: '20px 24px' }}>
                                        {/* Top row */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 12,
                                                background: pal.bg, border: `1.5px solid ${pal.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <i className="bi bi-tags-fill" style={{ fontSize: 20, color: pal.text }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link to={`/categories/edit/${c.id}`} className="sp-btn sp-btn-secondary sp-btn-icon sp-btn-sm" title="Modifier" style={{ color: 'var(--warning)' }}>
                                                    <i className="bi bi-pencil-fill" />
                                                </Link>
                                                <button onClick={() => handleDelete(c.id)} className="sp-btn sp-btn-danger sp-btn-icon sp-btn-sm" title="Supprimer">
                                                    <i className="bi bi-trash-fill" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <h3 style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                                            {c.name}
                                        </h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5, minHeight: 20 }}>
                                            {c.description || 'Aucune description'}
                                        </p>

                                        {/* Products count */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '5px 12px', borderRadius: 20,
                                                background: pal.bg, color: pal.text, border: `1px solid ${pal.border}`,
                                                fontSize: 12.5, fontWeight: 700,
                                            }}>
                                                <i className="bi bi-box-seam-fill" style={{ fontSize: 11 }} />
                                                {c.products_count ?? 0} produit{c.products_count !== 1 ? 's' : ''}
                                            </span>
                                            <Link to={`/products?category_id=${c.id}`}
                                                style={{ fontSize: 12.5, color: pal.text, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                Voir produits <i className="bi bi-arrow-right" />
                                            </Link>
                                        </div>
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

export default CategoryList;
