import { MdAccountBalance, MdPhoneAndroid, MdMoney, MdTrendingUp, MdSend } from 'react-icons/md';
import { clsx } from 'clsx';
// import './WalletCard.css';

const ICON_MAP = {
    cash: <MdMoney />,
    bank: <MdAccountBalance />,
    ewallet: <MdPhoneAndroid />,
    investment: <MdTrendingUp />
};

export default function WalletCard({ name, type, balance, icon, onTransfer }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="card wallet-card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '160px',
            background: type === 'investment' ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'var(--card-bg)',
            color: type === 'investment' ? 'white' : 'var(--text-primary)',
            border: type === 'investment' ? 'none' : '1px solid var(--border-color)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    fontSize: '2rem',
                    color: type === 'investment' ? 'rgba(255,255,255,0.8)' : 'var(--primary-color)'
                }}>
                    {ICON_MAP[type] || <MdAccountBalance />}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        opacity: 0.7
                    }}>
                        {type}
                    </span>
                    {onTransfer && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={onTransfer}
                                title="Transfer ke Anggaran"
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'inherit',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <MdSend size={14} />
                            </button>
                            {/* New Button: Request Funds */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onTransfer(true); }} // Pass true to indicate "Request" mode
                                title="Minta Dana dari Anggaran"
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'inherit',
                                    transition: 'background 0.2s',
                                    transform: 'rotate(180deg)' // Rotate Send icon to look like Receive
                                }}
                            >
                                <MdSend size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem', opacity: type === 'investment' ? 0.9 : 0.7 }}>{name}</h4>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(balance)}</h2>
            </div>
        </div>
    );
}
