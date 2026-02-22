import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="card"><p style={{ textAlign: 'center', padding: '2rem' }}>Data grafik belum tersedia</p></div>;
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tanggal {label}</p>
                    <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#EF4444' }}>
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }} key={data.length}>
            <h3 style={{ marginBottom: '1.5rem' }}>Tren Pengeluaran Harian</h3>
            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#EF4444"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
