import { useState, useEffect } from 'react';
import WalletCard from '../components/WalletCard';
import WalletForm from '../components/WalletForm';
import WalletTransferModal from '../components/WalletTransferModal';
import { api } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';

export default function Wallet() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [transferWallet, setTransferWallet] = useState(null);

    async function fetchWallets() {
        try {
            setLoading(true);
            const data = await api.getWallets();
            setWallets(data || []);
        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWallets();
    }, []);

    useRealtime('wallets', fetchWallets);

    const handleWalletAdded = () => {
        setShowAddForm(false);
        fetchWallets();
    };

    const handleTransfer = async ({ walletId, categoryId, amount, isRequest }) => {
        try {
            if (isRequest) {
                // CASE: Request Funds (Budget -> Wallet)
                // 1. Create Income Transaction (Wallet receives money)
                const transaction = {
                    type: 'income',
                    amount: amount,
                    category_id: categoryId, // Optional: tag it to category for record? Or null? detailed requirement said "meminta dana tambahan dari pagu anggaran". 
                    // If we tag it, it might count as negative expense? No, type is income.
                    // Let's tag it so we know where it came from.
                    wallet_id: walletId,
                    date: new Date().toISOString().split('T')[0],
                    description: 'Ambil dari Anggaran'
                };
                await api.createTransaction(transaction);

                // 2. Decrease Budget Limit
                const { data: category } = await api.supabase.from('categories').select('budget_limit').eq('id', categoryId).single();
                if (category) {
                    const newLimit = Math.max(0, (category.budget_limit || 0) - amount);
                    await api.updateCategory(categoryId, { budget_limit: newLimit });
                }

            } else {
                // CASE: Transfer to Budget (Wallet -> Budget)
                // 1. Create Expense Transaction
                const transaction = {
                    type: 'expense',
                    amount: amount,
                    category_id: categoryId,
                    wallet_id: walletId,
                    date: new Date().toISOString().split('T')[0],
                    description: 'Transfer ke Anggaran (Pagu)'
                };
                await api.createTransaction(transaction);

                // 2. Increase Budget Limit
                const { data: category } = await api.supabase.from('categories').select('budget_limit').eq('id', categoryId).single();
                if (category) {
                    const newLimit = (category.budget_limit || 0) + amount;
                    await api.updateCategory(categoryId, { budget_limit: newLimit });
                }
            }

            setTransferWallet(null);
            fetchWallets();
        } catch (error) {
            console.error('Transfer failed', error);
            throw error;
        }
    };

    const totalAssets = wallets.reduce((acc, curr) => acc + curr.balance, 0);
    const investmentAssets = wallets.filter(w => w.type === 'investment').reduce((acc, curr) => acc + curr.balance, 0);
    const liquidAssets = totalAssets - investmentAssets;

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="text-xl">Dompet & Aset</h2>
                    <p className="text-secondary text-sm">Kelola semua akun keuangan Anda</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Batal' : 'Tambah Dompet'}
                </button>
            </header>

            {showAddForm && (
                <WalletForm
                    onSave={handleWalletAdded}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {transferWallet && (
                <WalletTransferModal
                    wallet={transferWallet}
                    onClose={() => setTransferWallet(null)}
                    onTransfer={handleTransfer}
                />
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
                    <p style={{ opacity: 0.8 }}>Total Kekayaan Bersih</p>
                    <h1 style={{ fontSize: '2rem' }}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAssets)}
                    </h1>
                </div>
                <div className="card">
                    <p className="text-secondary">Aset Likuid (Cash/Bank)</p>
                    <h2 style={{ fontSize: '1.5rem' }}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(liquidAssets)}
                    </h2>
                </div>
            </div>

            <h3 className="text-lg" style={{ marginBottom: '1rem' }}>Daftar Akun</h3>
            {loading ? <p>Loading wallets...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {wallets.map((w) => (
                        <WalletCard
                            key={w.id}
                            name={w.name}
                            type={w.type}
                            balance={w.balance}
                            onTransfer={(isRequest = false) => setTransferWallet({ ...w, isRequest })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
