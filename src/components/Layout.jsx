import { Outlet, NavLink } from 'react-router-dom';
import { MdDashboard, MdReceipt, MdPieChart, MdShowChart, MdAccountBalanceWallet, MdLocalGasStation, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useState, useEffect } from 'react';
import './Layout.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: <MdDashboard /> },
    { path: '/transactions', label: 'Transaksi', icon: <MdReceipt /> },
    { path: '/budget', label: 'Pagu', icon: <MdPieChart /> },
    { path: '/trends', label: 'Tren', icon: <MdShowChart /> },
    { path: '/wallet', label: 'Dompet', icon: <MdAccountBalanceWallet /> },
    { path: '/fuel', label: 'Konsumsi BBM', icon: <MdLocalGasStation /> },
];

export default function Layout() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
                </header>
                <div className="content-scroll">
                    <Outlet />
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
