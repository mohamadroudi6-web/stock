import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const DepartmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (id) {
            api.get(`/departments/${id}`).then(res => {
                setFormData({
                    name: res.data.name,
                    description: res.data.description || ''
                });
            });
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await api.put(`/departments/${id}`, formData);
            } else {
                await api.post('/departments', formData);
            }
            navigate('/departments');
        } catch (err) {
            alert(err.response?.data?.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="sp-page-header">
                <div>
                    <h1 className="sp-page-title">{id ? 'Modifier' : 'Nouveau'} Département</h1>
                    <p className="sp-page-subtitle">Définissez une unité interne consommatrice de stock</p>
                </div>
                <button onClick={() => navigate('/departments')} className="sp-btn sp-btn-secondary">
                    Annuler
                </button>
            </div>

            <div className="sp-card">
                <div style={{ padding: 32 }}>
                    <form onSubmit={handleSubmit}>
                        <div className="sp-form-group">
                            <label className="sp-form-label">Nom du département *</label>
                            <input
                                type="text"
                                name="name"
                                className="sp-form-control"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="ex: Service Technique, Administration..."
                            />
                        </div>

                        <div className="sp-form-group">
                            <label className="sp-form-label">Description (optionnel)</label>
                            <textarea
                                name="description"
                                className="sp-form-control"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Décrivez le rôle de ce département..."
                            />
                        </div>

                        <button type="submit" className="sp-btn sp-btn-primary w-100" disabled={loading} style={{ justifyContent: 'center', marginTop: 20 }}>
                            {loading ? <div className="sp-spinner" style={{ width: 16, height: 16 }} /> : 'Enregistrer le département'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DepartmentForm;
