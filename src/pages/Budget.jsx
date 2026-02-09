import { useState, useEffect } from 'react';
import { MdRestaurant, MdDirectionsCar, MdShoppingCart, MdReceipt, MdMovie, MdLocalHospital, MdAttachMoney, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import BudgetCard from '../components/BudgetCard';
import CategoryForm from '../components/CategoryForm';
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
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    async function fetchBudgets() {
        try {
            setLoading(true);
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

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            try {
                await api.deleteCategory(id);
                fetchBudgets();
            } catch (error) {
                console.error('Failed to delete category', error);
                alert('Gagal menghapus kategori. Pastikan tidak ada transaksi yang terkait.');
            }
        }
    };

    const handleSave = () => {
        setShowForm(false);
        setEditingCategory(null);
        fetchBudgets();
    };

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
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowForm(true); }}>
                        <MdAdd style={{ marginRight: '4px' }} /> Atur Pagu
                    </button>
                )}
            </header>

            {showForm && (
                <CategoryForm
                    categoryToEdit={editingCategory}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditingCategory(null); }}
                />
            )}

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
                    <div key={b.id} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEdit(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><MdEdit /></button>
                            <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><MdDelete /></button>
                        </div>
                        <BudgetCard
                            category={b.name}
                            spent={b.spent}
                            limit={b.budget_limit}
                            icon={ICON_MAP[b.icon] || <MdAttachMoney />}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
