import { useEffect, useState, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward, MdPieChart, MdTrendingUp, MdLocalGasStation } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import DashboardChart from '../components/DashboardChart';
import RecentTransactions from '../components/RecentTransactions';
import { api } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';

export default function Dashboard() {
    const { selectedDate } = useOutletContext();
    const [data, setData] = useState({
        summary: { balance: 0, income: 0, expense: 0, investment: 0, budgetLimit: 0 },
        transactions: [],
        chart: []
    });
    const [fuelData, setFuelData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const month = selectedDate.getMonth();
            const year = selectedDate.getFullYear();

            const dashboardData = await api.getDashboardData(month, year);
            setData(dashboardData);

            const logs = await api.getFuelLogs(month, year);
            if (logs) {
                const formatKey = (str) => {
                    if (!str) return 'Lainnya';
                    return str.trim().split(/\s+/).map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
                };

                const vehicleStats = {};
                logs.forEach(log => {
                    const dist = log.distance ?? (log.final_km && log.initial_km ? log.final_km - log.initial_km : 0);

                    if (dist > 0 && log.vehicle_type) {
                        const vKey = formatKey(log.vehicle_type);
                        if (!vehicleStats[vKey]) {
                            vehicleStats[vKey] = {
                                vehicle: vKey,
                                totalDistance: 0,
                                fuels: {}
                            };
                        }

                        vehicleStats[vKey].totalDistance += dist;

                        const fKey = formatKey(log.fuel_type);
                        if (!vehicleStats[vKey].fuels[fKey]) {
                            vehicleStats[vKey].fuels[fKey] = { distance: 0, total_liters: 0, total_cost: 0 };
                        }

                        vehicleStats[vKey].fuels[fKey].distance += dist;
                        vehicleStats[vKey].fuels[fKey].total_liters += log.liters || 0;
                        vehicleStats[vKey].fuels[fKey].total_cost += log.total_cost || 0;
                    }
                });

                const chartData = Object.keys(vehicleStats).map(key => ({
                    name: key, // Vehicle name for YAxis
                    distance: vehicleStats[key].totalDistance,
                    fuels: vehicleStats[key].fuels
                }));
                setFuelData(chartData);
            }
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const realtimeTables = useMemo(() => ['wallets', 'transactions', 'categories', 'fuel_logs'], []);
    useRealtime(realtimeTables, loadData);

    const remainingBudget = Math.max(0, data.summary.budgetLimit - (data.summary.budgetUsed ?? data.summary.expense));

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
                                <h3>Konsumsi BBM Kendaraan</h3>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: 0 }} key={fuelData.length}>
                                <ResponsiveContainer width="99%" height="100%">
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
                                            formatter={(value, name, props) => {
                                                const fuels = props.payload.fuels;
                                                const fuelElements = Object.keys(fuels).map(fName => {
                                                    const fData = fuels[fName];
                                                    const kmPerLiter = fData.total_liters > 0
                                                        ? (fData.distance / fData.total_liters).toFixed(1)
                                                        : '-';
                                                    const formattedCost = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(fData.total_cost || 0);

                                                    return (
                                                        <div key={fName} style={{ marginBottom: '8px' }}>
                                                            <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-color)', marginBottom: '4px', paddingBottom: '2px', color: 'var(--primary-color)' }}>
                                                                {fName}
                                                            </div>
                                                            <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span style={{ fontSize: '0.85rem' }}>Jarak Tempuh: <strong>{fData.distance} km</strong></span>
                                                                <span style={{ fontSize: '0.85rem' }}>Biaya Total: <strong style={{ color: 'var(--error-color)' }}>{formattedCost}</strong></span>
                                                                <span style={{ fontSize: '0.85rem' }}>Konsumsi Rata-rata: <strong style={{ color: 'var(--success-color)' }}>{kmPerLiter} km/l</strong></span>
                                                            </div>
                                                        </div>
                                                    );
                                                });

                                                return [
                                                    <div key="val" style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Total Jarak Keseluruhan: <strong>{value} km</strong></div>
                                                        {fuelElements}
                                                    </div>,
                                                    ''
                                                ];
                                            }}
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
