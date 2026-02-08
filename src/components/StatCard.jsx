import { clsx } from 'clsx';
import './StatCard.css';

export default function StatCard({ title, amount, icon, color, type }) {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

    return (
        <div className={clsx('stat-card', type)}>
            <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
                {icon}
            </div>
            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <h3 className="stat-amount">{formattedAmount}</h3>
            </div>
        </div>
    );
}
