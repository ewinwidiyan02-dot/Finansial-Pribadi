import { useState, useEffect } from 'react';
import { MdRestaurant, MdDirectionsCar, MdShoppingCart, MdReceipt, MdMovie, MdLocalHospital, MdAttachMoney } from 'react-icons/md';
import BudgetCard from '../components/BudgetCard';
import { api } from '../services/api';

const ICON_MAP = {
    'MdRestaurant': <MdRestaurant />,
    'MdDirectionsCar': <MdDirectionsCar />,
    'MdShoppingCart': <MdShoppingCart />,
    'MdReceipt': <MdReceipt />,
    'MdMovie': <MdMovie />,
    'MdLocalHospital': <MdLocalHospital />,
    'MdAttachMoney': <MdAttachMoney />
};

export default function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBudgets() {
            try {
                const data = await api.getBudgetData();
                // Filter only expense categories for budget view, or show all but highlight expense
                const expenseBudgets = data.filter(c => c.type === 'expense');
                setBudgets(expenseBudgets || []);
            } catch (error) {
                console.error('Failed to fetch budget data', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBudgets();
    }, []);

    const totalBudget = budgets.reduce((acc, curr) => acc + (curr.budget_limit || 0), 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + (curr.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="text-xl">Pagu Anggaran</h2>
                    <p className="text-secondary text-sm">Monitor pengeluaran per kategori</p>
                </div>
                <button className="btn btn-primary">Atur Pagu</button>
            </header>

            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span>Total Anggaran Bulan Ini</span>
                    <span style={{ fontWeight: 600 }}>{percentage.toFixed(0)}% Terpakai</span>
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalRemaining)}
                </h1>
                <p style={{ opacity: 0.8 }}>Sisa dari total {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalBudget)}</p>

                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', marginTop: '1rem', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '9999px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {loading ? <p>Loading budgets...</p> : budgets.map((b) => (
                    <BudgetCard
                        key={b.id}
                        category={b.name}
                        spent={b.spent}
                        limit={b.budget_limit}
                        icon={ICON_MAP[b.icon] || <MdAttachMoney />}
                    />
                ))}
            </div>
        </div>
    );
}
