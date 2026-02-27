import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function WalletTransferModal({ wallet, onClose, onTransfer }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const isRequest = wallet?.isRequest;

    useEffect(() => {
        async function loadCategories() {
            try {
                const cats = await api.getCategories();
                // Filter only expense categories
                setCategories(cats.filter(c => c.type === 'expense') || []);
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        }
        loadCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            alert('Mohon masukkan jumlah yang valid');
            return;
        }

        if (!isRequest && parseFloat(amount) > wallet.balance) {
            alert('Saldo dompet tidak mencukupi');
            return;
        }

        if (!category) {
            alert(isRequest ? 'Mohon pilih kategori sumber' : 'Mohon pilih kategori tujuan');
            return;
        }

        if (isRequest) {
            const selectedCat = categories.find(c => c.id == category);
            if (selectedCat && parseFloat(amount) > (selectedCat.budget_limit || 0)) {
                alert('Pagu anggaran tidak mencukupi untuk diambil.');
                return;
            }
        }

        setLoading(true);
        try {
            await onTransfer({
                walletId: wallet.id,
                categoryId: category,
                amount: parseFloat(amount),
                isRequest
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
                <h3>{isRequest ? 'Minta Dana dari Anggaran' : 'Transfer ke Anggaran'}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                    {isRequest ? 'Ke: ' : 'Dari: '} <strong>{wallet.name}</strong> <br />
                    Saldo: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(wallet.balance)}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="text-sm text-secondary">Jumlah {isRequest ? 'Permintaan' : 'Transfer'}</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Rp 0"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-secondary">
                            {isRequest ? 'Dari Kategori (Pagu Anggaran)' : 'Ke Kategori (Pagu Anggaran)'}
                        </label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">{isRequest ? 'Pilih Kategori Sumber' : 'Pilih Kategori Tujuan'}</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {isRequest ? `(Sisa Limit: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(c.budget_limit || 0)})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? (isRequest ? 'Memproses...' : 'Proses Transfer') : 'Konfirmasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
