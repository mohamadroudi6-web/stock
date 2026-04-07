import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
    const map = {
        admin:       { cls: 'sp-badge-danger',  icon: 'bi-shield-fill-check', label: 'Admin' },
        storekeeper: { cls: 'sp-badge-info',    icon: 'bi-box-seam-fill',     label: 'Magasinier' },
        supplier:    { cls: 'sp-badge-success', icon: 'bi-truck-front-fill',  label: 'Fournisseur' },
    };
    const r = map[role] || { cls: 'sp-badge-neutral', icon: 'bi-person', label: role };
    return (
        <span className={`sp-badge ${r.cls}`}>
            <i className={`bi ${r.icon}`} />
            {r.label}
        </span>
    );
};

/* ════════════════════════════════════
   UserList Page
═════════════════════════════════════ */
const UserList = () => {
    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.data || res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet accès utilisateur ?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression.');
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleColors = { admin: '#ef4444', storekeeper: '#3b82f6', supplier: '#10b981' };

    if (loading) return (
        <div className="sp-loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="sp-spinner" /><span>Chargement des utilisateurs...</span>
        </div>
    );

    return (
        <div>
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">Utilisateurs & Accès</h1>
                    <p className="sp-page-subtitle">{users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/users/new" className="sp-btn sp-btn-primary">
                    <i className="bi bi-person-plus-fill" /> Nouvel utilisateur
                </Link>
            </div>

            <div className="sp-card">
                {/* Filter */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="sp-input-group" style={{ maxWidth: 380 }}>
                        <i className="bi bi-search sp-input-icon" />
                        <input
                            type="text" className="sp-form-control"
                            placeholder="Rechercher par nom ou email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="sp-table-wrapper">
                    <table className="sp-table">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Rôle</th>
                                <th>Statut</th>
                                <th>Créé le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="sp-loading-overlay" style={{ padding: 40 }}>
                                            <i className="bi bi-people" style={{ fontSize: 36, color: 'var(--text-muted)' }} />
                                            <span>Aucun utilisateur trouvé</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(u => {
                                const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                const color    = roleColors[u.role] || 'var(--gray-400)';
                                return (
                                    <tr key={u.id}>
                                        {/* User */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                                    background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 800, fontSize: 13, color: 'white',
                                                }}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                                                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td>
                                            <RoleBadge role={u.role} />
                                            {u.supplier && (
                                                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                                                    <i className="bi bi-building" style={{ marginRight: 4 }} />
                                                    {u.supplier.name}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`sp-badge ${u.is_active ? 'sp-badge-success' : 'sp-badge-danger'}`}>
                                                <i className={`bi ${u.is_active ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
                                                {u.is_active ? 'Actif' : 'Bloqué'}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                                {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                <Link to={`/users/edit/${u.id}`} className="sp-btn sp-btn-secondary sp-btn-icon sp-btn-sm" title="Modifier" style={{ color: 'var(--warning)' }}>
                                                    <i className="bi bi-pencil-fill" />
                                                </Link>
                                                <button onClick={() => handleDelete(u.id)} className="sp-btn sp-btn-danger sp-btn-icon sp-btn-sm" title="Supprimer">
                                                    <i className="bi bi-trash-fill" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserList;
