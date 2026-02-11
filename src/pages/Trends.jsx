import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

export default function Trends() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTrends() {
            // In a real scenario, we would ask API for aggregated monthly data.
            // For now, we'll just mock it or try to calculate from transactions if available.
            // Since we don't have a specific endpoint for monthly aggregation in api.js yet,
            // we will use a refined mock or improved logic.
            // Let's stick to the static data for now as the user didn't ask for complex aggregation logic in this specific turn,
            // but requested "syncing". However, to be "synced" implies real data.
            // Let's implement a simple fetch from transactions and aggregate locally.

            try {
                const transactions = await api.getTransactions();
                if (transactions) {
                    // Very simple aggregation by month
                    const monthlyStats = {};
                    transactions.forEach(t => {
                        const date = new Date(t.date);
                        const month = date.toLocaleString('default', { month: 'short' });
                        if (!monthlyStats[month]) monthlyStats[month] = { name: month, income: 0, expense: 0 };

                        if (t.type === 'income') monthlyStats[month].income += t.amount;
                        else monthlyStats[month].expense += t.amount;
                    });

                    // If empty, show some placeholders or empty state
                    const chartData = Object.values(monthlyStats);
                    setData(chartData.length > 0 ? chartData : []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadTrends();
    }, []);

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl">Analisis Tren</h2>
                <p className="text-secondary text-sm">Perbandingan Pemasukan & Pengeluaran Bulanan</p>
            </header>

            <div className="card" style={{ height: '400px' }}>
                {loading ? <p style={{ textAlign: 'center', paddingTop: '150px' }}>Loading chart...</p> : (
                    data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: 'var(--shadow-md)',
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p style={{ textAlign: 'center', paddingTop: '150px' }}>Belum ada data transaksi untuk ditampilkan.</p>
                )}
            </div>
        </div>
    );
}
