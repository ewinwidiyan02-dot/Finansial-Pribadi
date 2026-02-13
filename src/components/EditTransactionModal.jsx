import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function EditTransactionModal({ transaction, onClose, onUpdate }) {
    const [type, setType] = useState(transaction.type);
    const [amount, setAmount] = useState(transaction.amount);
    const [category, setCategory] = useState(transaction.category_id);
    const [wallet, setWallet] = useState(transaction.wallet_id);
    const [date, setDate] = useState(transaction.date);
    const [description, setDescription] = useState(transaction.description);

    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadOptions() {
            try {
                const [cats, wals] = await Promise.all([
                    api.getCategories(),
                    api.getWallets()
                ]);
                setCategories(cats || []);
                setWallets(wals || []);
            } catch (error) {
                console.error('Failed to load options', error);
            }
        }
        loadOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newTransaction = {
                type,
                amount: parseFloat(amount),
                category_id: category || null,
                wallet_id: wallet || null,
                date,
                description
            };

            await api.updateTransaction(transaction.id, transaction, newTransaction);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update transaction', error);
            alert('Gagal mengupdate transaksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>Edit Transaksi</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setType('income')}
                            style={{ flex: 1, justifyContent: 'center', backgroundColor: type === 'income' ? '#10B981' : '' }}
                        >
                            Pemasukan
                        </button>
                        <button
                            type="button"
                            className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setType('expense')}
                            style={{ flex: 1, justifyContent: 'center', backgroundColor: type === 'expense' ? '#EF4444' : '' }}
                        >
                            Pengeluaran
                        </button>
                    </div>

                    <div>
                        <label className="text-sm text-secondary">Jumlah</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="text-sm text-secondary">Kategori (Opsional)</label>
                            <select value={category || ""} onChange={(e) => setCategory(e.target.value)}>
                                <option value="">Pilih Kategori</option>
                                {categories.filter(c => c.type === type).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-secondary">Dompet</label>
                            <select value={wallet} onChange={(e) => setWallet(e.target.value)}>
                                <option value="">Tanpa Dompet</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-secondary">Tanggal</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>

                    <div>
                        <label className="text-sm text-secondary">Deskripsi</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
