import { useEffect, useState } from 'react';
import { MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward, MdPieChart, MdTrendingUp } from 'react-icons/md';
import StatCard from '../components/StatCard';
import DashboardChart from '../components/DashboardChart';
import RecentTransactions from '../components/RecentTransactions';
import { api } from '../services/api';

export default function Dashboard() {
    const [data, setData] = useState({
        summary: { balance: 0, income: 0, expense: 0, investment: 0, budgetLimit: 0 },
        transactions: [],
        chart: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const dashboardData = await api.getDashboardData();
                // Chart data logic would be more complex, we'll retain a fallback or simple generation for now
                // For simplicity in this step, we keep the static chart or leave it empty if no data
                const mockChart = [
                    { name: 'Sen', amount: 0 },
                    { name: 'Sel', amount: 0 },
                    { name: 'Rab', amount: 0 },
                    { name: 'Kam', amount: 0 },
                    { name: 'Jum', amount: 0 },
                    { name: 'Sab', amount: 0 },
                    { name: 'Min', amount: 0 },
                ];

                setData({
                    ...dashboardData,
                    chart: mockChart // Enhancement: Fetch real daily trend
                });
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const remainingBudget = Math.max(0, data.summary.budgetLimit - data.summary.expense);

    return (
        <div className="container" style={{ paddingTop: '1rem' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl">Ringkasan Keuangan</h2>
                <p className="text-secondary text-sm">Overview saldo dan transaksi terakhir</p>
            </header>

            <div className="grid-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard
                    title="Total Saldo (Uang Cash)"
                    amount={data.summary.balance}
                    icon={<MdAccountBalanceWallet />}
                    color="#3B82F6"
                    type="balance"
                />
                <StatCard
                    title="Total Investasi"
                    amount={data.summary.investment}
                    icon={<MdTrendingUp />}
                    color="#8B5CF6"
                    type="investment"
                />
                <StatCard
                    title="Sisa Anggaran"
                    amount={remainingBudget}
                    icon={<MdPieChart />}
                    color="#F59E0B"
                    type="budget"
                />
                <StatCard
                    title="Pemasukan"
                    amount={data.summary.income}
                    icon={<MdArrowUpward />}
                    color="#10B981"
                    type="income"
                />
                <StatCard
                    title="Pengeluaran"
                    amount={data.summary.expense}
                    icon={<MdArrowDownward />}
                    color="#EF4444"
                    type="expense"
                />
            </div>

            <div className="grid-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="chart-section">
                    {/* We might need to implement real trend data fetching later */}
                    <DashboardChart data={data.chart} />
                </div>
                <div className="transactions-section">
                    <RecentTransactions transactions={data.transactions} />
                </div>
            </div>
        </div>
    );
}
