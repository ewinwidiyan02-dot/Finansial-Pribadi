import { useState } from 'react';
import { api } from '../services/api';

export default function WalletForm({ onSave, onCancel }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('cash');
    const [balance, setBalance] = useState('');
    const [icon, setIcon] = useState('MdAttachMoney');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const walletData = {
                name,
                type,
                balance: parseFloat(balance) || 0,
                icon
            };

            await api.createWallet(walletData);
            onSave();
        } catch (error) {
            console.error('Error saving wallet:', error);
            alert(`Gagal menyimpan dompet: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Tambah Dompet Baru</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label className="text-sm text-secondary">Nama Dompet</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Contoh: Dompet Utama, BCA, GoPay"
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label className="text-sm text-secondary">Tipe</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="cash">Tunai (Cash)</option>
                            <option value="bank">Bank</option>
                            <option value="ewallet">E-Wallet</option>
                            <option value="investment">Investasi</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="text-sm text-secondary">Saldo Awal</label>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            placeholder="Rp 0"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm text-secondary">Icon</label>
                    <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                        <option value="MdAttachMoney">Uang (Default)</option>
                        <option value="MdAccountBalance">Bank</option>
                        <option value="MdPhoneAndroid">HP/E-Wallet</option>
                        <option value="MdTrendingUp">Investasi</option>
                        <option value="MdCreditCard">Kartu</option>
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
