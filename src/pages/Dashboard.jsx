import { useEffect, useState } from 'react';
import { MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward, MdPieChart, MdTrendingUp, MdLocalGasStation } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    const [fuelData, setFuelData] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadData() {
        try {
            const dashboardData = await api.getDashboardData();
            setData(dashboardData);

            if (logs) {
                const vehicleStats = {};
                logs.forEach(log => {
                    if (log.distance) {
                        if (!vehicleStats[log.vehicle_type]) {
                            vehicleStats[log.vehicle_type] = { distance: 0, fuelTypes: new Set() };
                        }
                        vehicleStats[log.vehicle_type].distance += log.distance;
                        if (log.fuel_type) {
                            vehicleStats[log.vehicle_type].fuelTypes.add(log.fuel_type);
                        }
                    }
                });
                const chartData = Object.keys(vehicleStats).map(key => ({
                    name: key,
                    distance: vehicleStats[key].distance,
                    fuelType: Array.from(vehicleStats[key].fuelTypes).join(', ')
                }));
                setFuelData(chartData);
            }
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
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

                    {fuelData.length > 0 && (
                        <div className="card" style={{ marginTop: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                <MdLocalGasStation style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }} />
                                <h3>Konsumsi BBM (Jarak Tempuh)</h3>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={fuelData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                            width={100}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                boxShadow: 'var(--shadow-md)',
                                                backgroundColor: 'var(--card-bg)',
                                                color: 'var(--text-primary)'
                                            }}
                                            formatter={(value, name, props) => [
                                                <div key="val" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontWeight: 600 }}>{value} km</span>
                                                    {props.payload.fuelType && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                                            {props.payload.fuelType}
                                                        </span>
                                                    )}
                                                </div>,
                                                ''
                                            ]}
                                        />
                                        <Bar dataKey="distance" fill="var(--primary-color)" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
                <div className="transactions-section">
                    <RecentTransactions
                        transactions={data.transactions}
                        onTransactionUpdated={loadData}
                    />
                </div>
            </div>
        </div>
    );
}
