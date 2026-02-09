import { useState, useEffect } from 'react';
import { api } from '../services/api';
// import './CategoryForm.css'; // Optional: Use inline styles or create a CSS file

export default function CategoryForm({ categoryToEdit, onSave, onCancel }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('expense');
    const [budgetLimit, setBudgetLimit] = useState('');
    const [icon, setIcon] = useState('MdAttachMoney');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setType(categoryToEdit.type);
            setBudgetLimit(categoryToEdit.budget_limit || '');
            setIcon(categoryToEdit.icon || 'MdAttachMoney');
        }
    }, [categoryToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const categoryData = {
                name,
                type,
                budget_limit: parseFloat(budgetLimit) || 0,
                icon
            };

            if (categoryToEdit) {
                await api.updateCategory(categoryToEdit.id, categoryData);
            } else {
                await api.createCategory(categoryData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(`Gagal menyimpan kategori: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem' }}>{categoryToEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label className="text-sm text-secondary">Nama Kategori</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Contoh: Belanja Bulanan"
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label className="text-sm text-secondary">Tipe</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} disabled={!!categoryToEdit}>
                            <option value="expense">Pengeluaran</option>
                            <option value="income">Pemasukan</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="text-sm text-secondary">Pagu Anggaran (Opsional)</label>
                        <input
                            type="number"
                            value={budgetLimit}
                            onChange={(e) => setBudgetLimit(e.target.value)}
                            placeholder="Rp 0"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm text-secondary">Icon (Kode Material Icon)</label>
                    <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                        <option value="MdAttachMoney">Default (Money)</option>
                        <option value="MdRestaurant">Makanan</option>
                        <option value="MdDirectionsCar">Transportasi</option>
                        <option value="MdShoppingCart">Belanja</option>
                        <option value="MdReceipt">Tagihan</option>
                        <option value="MdMovie">Hiburan</option>
                        <option value="MdLocalHospital">Kesehatan</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" onClick={onCancel} className="btn" style={{ background: '#E2E8F0', color: '#1E293B' }}>Batal</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
