import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BudgetDeficitModal({ deficit, onClose, onConfirm }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                const cats = await api.getCategories();
                // Fetch budget status for each expense category to show remaining balance
                const expenseCats = cats.filter(c => c.type === 'expense');

                const catsWithStatus = await Promise.all(expenseCats.map(async (c) => {
                    const status = await api.getCategoryBudgetStatus(c.id);
                    return { ...c, remaining: status?.remaining || 0 };
                }));

                // Filter out categories with 0 or negative remaining, and sort by highest remaining
                setCategories(catsWithStatus.filter(c => c.remaining > 0));
            } catch (error) {
                console.error('Failed to load categories', error);
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, []);

    const handleConfirm = () => {
        if (!selectedCategory) {
            alert('Mohon pilih kategori sumber dana');
            return;
        }
        onConfirm(selectedCategory);
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ color: '#EF4444' }}>Anggaran Tidak Cukup!</h3>
                <p style={{ margin: '1rem 0' }}>
                    Transaksi ini melebihi sisa anggaran sebesar <br />
                    <strong style={{ fontSize: '1.25rem' }}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(deficit)}</strong>
                </p>
                <p className="text-secondary text-sm" style={{ marginBottom: '1rem' }}>
                    Apakah Anda ingin menutup kekurangan ini dengan mengambil dana dari pagu kategori lain?
                </p>

                {loading ? <p>Mencari dana...</p> : (
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="text-sm text-secondary">Ambil dari Kategori:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} (Sisa: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(c.remaining)})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => onConfirm(null)} style={{ flex: 1, justifyContent: 'center' }}>
                        Biarkan (Tetap Simpan)
                    </button>
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={!selectedCategory} style={{ flex: 1, justifyContent: 'center' }}>
                        Ambil Dana
                    </button>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: '#64748B', width: '100%', marginTop: '1rem', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                    Batal Transaksi
                </button>
            </div>
        </div>
    );
}
