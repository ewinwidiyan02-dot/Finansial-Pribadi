import { useState, useEffect } from 'react';
import { api } from '../services/api';
// import './TransactionForm.css';

export default function TransactionForm({ onTransactionAdded }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [wallet, setWallet] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

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

                // Set default wallet if available
                if (wals && wals.length > 0) setWallet(wals[0].id);
            } catch (error) {
                console.error('Failed to load options', error);
            }
        }
        loadOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category) {
            alert('Mohon pilih kategori');
            return;
        }

        setLoading(true);
        try {
            const newTransaction = {
                type,
                amount: parseFloat(amount),
                category_id: category,
                wallet_id: wallet || null, // Send null if empty
                date,
                description
            };

            await api.createTransaction(newTransaction);

            // Reset form
            setAmount('');
            setDescription('');
            // Keep the last selected wallet or reset? User might want to keep it. 
            // Let's keep it for convenience, or strictly follow "reset form" implies all.
            // The original code didn't reset wallet/category, only amount/desc.
            if (onTransactionAdded) onTransactionAdded();

        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Gagal menyimpan transaksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h3>Tambah Transaksi</h3>
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
                        placeholder="Rp 0"
                        required
                        style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="text-sm text-secondary">Kategori</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">Pilih Kategori</option>
                            {categories.filter(c => c.type === type).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-secondary">Dompet (Opsional)</label>
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
                        placeholder="Contoh: Makan Siang"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
            </form>
        </div>
    );
}
