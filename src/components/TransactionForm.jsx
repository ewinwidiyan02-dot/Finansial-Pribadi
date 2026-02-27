import { useState, useEffect } from 'react';
import { api } from '../services/api';
import BudgetDeficitModal from '../components/BudgetDeficitModal';
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
    const [deficitData, setDeficitData] = useState(null);

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

                // Set default category to "Saving Lain-lain" for income
                if (cats && type === 'income') {
                    const defaultIncomeCat = cats.find(c => c.name.toLowerCase() === 'saving lain-lain' && c.type === 'income');
                    if (defaultIncomeCat) {
                        setCategory(defaultIncomeCat.id);
                    }
                }
            } catch (error) {
                console.error('Failed to load options', error);
            }
        }
        loadOptions();
    }, [type]); // Added type as dependency so when type changes, category updates

    const processTransaction = async (sourceCategoryId = null) => {
        setLoading(true);
        try {
            // If source category is selected, handle deficit transfer first
            if (sourceCategoryId && deficitData) {
                await api.transferBudgetLimit(sourceCategoryId, category, deficitData.deficit);
            }

            // 3. Create Transaction
            const newTransaction = {
                type,
                amount: parseFloat(amount),
                category_id: category || null,
                wallet_id: wallet || null,
                date,
                description
            };

            await api.createTransaction(newTransaction);

            // Reset form
            setAmount('');
            setDescription('');
            setDeficitData(null);

            if (onTransactionAdded) onTransactionAdded();

        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Gagal menyimpan transaksi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If no category is selected, Wallet is REQUIRED to deduct balance
        if (!category && !wallet && type === 'expense') {
            alert('Jika tanpa kategori, mohon pilih Dompet sebagai sumber dana.');
            return;
        }

        const numericAmount = parseFloat(amount);

        // Check Budget if Expense
        if (type === 'expense') {
            try {
                const status = await api.getCategoryBudgetStatus(category);
                if (status) {
                    // Check if transaction date is in current month to apply budget logic? 
                    // Ideally yes, but for now we assume budget applies continuously or blindly call api helper which checks current month.
                    // The api helper calls for current month. If user posts for past date, this might be slightly off logic-wise but acceptable for MVP ("Smart Check").

                    if (numericAmount > status.remaining) {
                        setDeficitData({
                            deficit: numericAmount - status.remaining
                        });
                        return; // Stop here, show modal
                    }
                }
            } catch (error) {
                console.error("Budget check failed", error);
                // Proceed anyway if check fails? Or block? Let's proceed to avoid blocking user.
            }
        }

        // Proceed directly if no deficit
        processTransaction();
    };

    return (
        <div className="card">
            <h3>Tambah Transaksi</h3>

            {deficitData && (
                <BudgetDeficitModal
                    deficit={deficitData.deficit}
                    onClose={() => setDeficitData(null)}
                    onConfirm={(sourceId) => processTransaction(sourceId)}
                />
            )}

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
                        <label className="text-sm text-secondary">Kategori (Opsional)</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
