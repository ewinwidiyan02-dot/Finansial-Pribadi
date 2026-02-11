import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function TransferModal({ category, categories = [], onClose, onTransfer }) {
    const [type, setType] = useState('save'); // 'save', 'topup', or 'transfer'
    const [amount, setAmount] = useState('');
    const [wallet, setWallet] = useState('');
    const [wallets, setWallets] = useState([]);
    const [targetCategoryId, setTargetCategoryId] = useState('');
    const [loading, setLoading] = useState(false);
    const [useWalletForTopUp, setUseWalletForTopUp] = useState(true);

    const remaining = category.budget_limit - category.spent;

    useEffect(() => {
        async function loadWallets() {
            try {
                const wals = await api.getWallets();
                setWallets(wals || []);
                if (wals && wals.length > 0) setWallet(wals[0].id);
            } catch (error) {
                console.error('Failed to load wallets', error);
            }
        }
        loadWallets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            alert('Mohon masukkan jumlah yang valid');
            return;
        }

        if (type === 'save' && parseFloat(amount) > remaining) {
            alert('Jumlah melebihi sisa anggaran');
            return;
        }

        if ((type === 'save' || (type === 'topup' && useWalletForTopUp)) && !wallet) {
            alert('Mohon pilih dompet');
            return;
        }

        if (type === 'transfer' && !targetCategoryId) {
            alert('Mohon pilih kategori tujuan');
            return;
        }

        setLoading(true);
        try {
            await onTransfer({
                type,
                amount: parseFloat(amount),
                walletId: wallet,
                useWallet: type === 'topup' ? useWalletForTopUp : true,
                targetCategoryId: type === 'transfer' ? targetCategoryId : null
            });
            onClose();
        } catch (error) {
            console.error('Transfer failed', error);
            alert('Gagal melakukan transfer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>Atur Anggaran: {category.name}</h3>

                <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                    <button
                        className={`btn ${type === 'save' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType('save')}
                        style={{ flex: 1, justifyContent: 'center', backgroundColor: type === 'save' ? '#10B981' : '', fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                        Simpan Sisa
                    </button>
                    <button
                        className={`btn ${type === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType('transfer')}
                        style={{ flex: 1, justifyContent: 'center', backgroundColor: type === 'transfer' ? '#F59E0B' : '', fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                        Transfer
                    </button>
                    <button
                        className={`btn ${type === 'topup' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType('topup')}
                        style={{ flex: 1, justifyContent: 'center', backgroundColor: type === 'topup' ? '#3B82F6' : '', fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                        Tambah Pagu
                    </button>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                    {type === 'save'
                        ? `Pindahkan sisa anggaran (Maks: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(remaining)}) ke dompet.`
                        : type === 'transfer'
                            ? 'Pindahkan anggaran ke kategori lain.'
                            : 'Tambah batas anggaran kategori ini.'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="text-sm text-secondary">Jumlah</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Rp 0"
                            required
                        />
                    </div>

                    {type === 'transfer' && (
                        <div>
                            <label className="text-sm text-secondary">Pindah ke Kategori</label>
                            <select
                                value={targetCategoryId}
                                onChange={(e) => setTargetCategoryId(e.target.value)}
                                required
                                className="form-select"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                            >
                                <option value="">-- Pilih Kategori Tujuan --</option>
                                {categories
                                    .filter(c => c.id !== category.id && c.type === 'expense')
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {(type === 'save' || (type === 'topup' && useWalletForTopUp)) && (
                        <div>
                            <label className="text-sm text-secondary">
                                {type === 'save' ? 'Simpan ke Dompet' : 'Ambil dari Dompet'}
                            </label>
                            <select value={wallet} onChange={(e) => setWallet(e.target.value)} required>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(w.balance)})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type === 'topup' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="useWallet"
                                checked={useWalletForTopUp}
                                onChange={(e) => setUseWalletForTopUp(e.target.checked)}
                            />
                            <label htmlFor="useWallet" className="text-sm text-secondary">
                                Ambil saldo dari dompet (Catat sebagai Pengeluaran)
                            </label>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? 'Memproses...' : 'Konfirmasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
