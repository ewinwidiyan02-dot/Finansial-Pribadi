import { Outlet, NavLink } from 'react-router-dom';
import { MdDashboard, MdReceipt, MdPieChart, MdAccountBalanceWallet, MdLocalGasStation, MdDarkMode, MdLightMode, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useState, useEffect } from 'react';
import './Layout.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: <MdDashboard /> },
    { path: '/transactions', label: 'Transaksi', icon: <MdReceipt /> },
    { path: '/budget', label: 'Pagu', icon: <MdPieChart /> },
    { path: '/wallet', label: 'Dompet', icon: <MdAccountBalanceWallet /> },
    { path: '/fuel', label: 'Konsumsi BBM', icon: <MdLocalGasStation /> },
];

export default function Layout() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const changeMonth = (increment) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + increment);
            return newDate;
        });
    };

    const formatMonthYear = (date) => {
        return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
    };
    return (
        <div className="layout">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.svg" alt="Logo" style={{ height: '32px', width: '32px', marginRight: '12px' }} />
                    <h2>Finansialku</h2>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo.svg" alt="Logo" style={{ height: '32px', width: '32px' }} />
                        <h1 className="page-title">Personal Finance</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--card-bg)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}><MdChevronLeft size={20} /></button>
                            <span style={{ fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>{formatMonthYear(selectedDate)}</span>
                            <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}><MdChevronRight size={20} /></button>
                        </div>
                        <button
                            onClick={toggleTheme}
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
                        </button>
                        <div className="user-profile">
                            <div className="avatar">A</div>
                        </div>
                    </div>
                </header>
                <div className="content-scroll">
                    <Outlet context={{ selectedDate, setSelectedDate }} />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="bottom-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
