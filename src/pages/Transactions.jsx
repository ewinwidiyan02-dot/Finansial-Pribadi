import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import RecentTransactions from '../components/RecentTransactions';
import { api } from '../services/api';

export default function Transactions() {
    const { selectedDate } = useOutletContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const month = selectedDate.getMonth();
            const year = selectedDate.getFullYear();
            const data = await api.getTransactions(month, year);
            setTransactions(data || []);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedDate]);

    const handleTransactionAdded = () => {
        fetchTransactions();
    };

    const filteredTransactions = transactions.filter((t) => {
        const query = searchQuery.toLowerCase();
        return (
            (t.description || '').toLowerCase().includes(query) ||
            (t.amount || 0).toString().includes(query) ||
            (t.category?.name || '').toLowerCase().includes(query)
        );
    });

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="text-xl">Transaksi</h2>
                <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.875rem',
                        width: '200px'
                    }}
                />
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ order: 1 }}>
                    <TransactionForm onTransactionAdded={handleTransactionAdded} />
                </div>
                <div style={{ order: 2 }}>
                    {loading ? <p>Loading...</p> : (
                        <RecentTransactions
                            transactions={filteredTransactions}
                            onTransactionUpdated={fetchTransactions}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
