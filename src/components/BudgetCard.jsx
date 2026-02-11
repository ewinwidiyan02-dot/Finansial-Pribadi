import { clsx } from 'clsx';
// import './BudgetCard.css';

export default function BudgetCard({ category, spent, limit, icon }) {
    const percentage = Math.min((spent / limit) * 100, 100);
    const isOverBudget = spent > limit;
    const remaining = limit - spent;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="card budget-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '0.5rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{category}</h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Sisa: <span style={{ color: remaining < 0 ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 600 }}>{formatCurrency(remaining)}</span>
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(spent)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>dari {formatCurrency(limit)}</div>
                </div>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: percentage >= 100 ? '#EF4444' : percentage >= 80 ? '#F59E0B' : '#10B981',
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease-in-out, background-color 0.5s ease'
                    }}
                />
            </div>
        </div>
    );
}
