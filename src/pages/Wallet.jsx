import { useState, useEffect } from 'react';
import WalletCard from '../components/WalletCard';
import WalletForm from '../components/WalletForm';
import { api } from '../services/api';

export default function Wallet() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    async function fetchWallets() {
        try {
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

    const handleWalletAdded = () => {
        setShowAddForm(false);
        fetchWallets();
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
