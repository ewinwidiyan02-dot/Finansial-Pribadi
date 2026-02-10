import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MdArrowUpward, MdArrowDownward, MdEdit } from 'react-icons/md';
import EditTransactionModal from './EditTransactionModal';
import './RecentTransactions.css';

export default function RecentTransactions({ transactions, onTransactionUpdated }) {
    const [editingTransaction, setEditingTransaction] = useState(null);

    if (!transactions || transactions.length === 0) {
        return (
            <div className="card empty-state">
                <p>Belum ada transaksi.</p>
            </div>
        );
    }

    return (
        <>
            <div className="card recent-transactions">
                <div className="card-header">
                    <h3>Transaksi Terakhir</h3>
                </div>
                <div className="transaction-list">
                    {transactions.map((t) => (
                        <div key={t.id} className="transaction-item">
                            <div className={`transaction-icon ${t.type}`}>
                                {t.type === 'income' ? <MdArrowUpward /> : <MdArrowDownward />}
                            </div>
                            <div className="transaction-details">
                                <span className="transaction-desc">{t.description}</span>
                                <span className="transaction-date">
                                    {format(new Date(t.date), 'dd MMM yyyy', { locale: id })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className={`transaction-amount ${t.type}`}>
                                    {t.type === 'income' ? '+' : '-'}
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0
                                    }).format(t.amount)}
                                </span>
                                <button
                                    className="btn-icon"
                                    onClick={() => setEditingTransaction(t)}
                                    title="Edit Transaksi"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                                >
                                    <MdEdit />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editingTransaction && (
                <EditTransactionModal
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    onUpdate={() => {
                        setEditingTransaction(null);
                        if (onTransactionUpdated) onTransactionUpdated();
                    }}
                />
            )}
        </>
    );
}
