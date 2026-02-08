import { Outlet, NavLink } from 'react-router-dom';
import { MdDashboard, MdReceipt, MdPieChart, MdShowChart, MdAccountBalanceWallet } from 'react-icons/md';
import './Layout.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: <MdDashboard /> },
    { path: '/transactions', label: 'Transaksi', icon: <MdReceipt /> },
    { path: '/budget', label: 'Pagu', icon: <MdPieChart /> },
    { path: '/trends', label: 'Tren', icon: <MdShowChart /> },
    { path: '/wallet', label: 'Dompet', icon: <MdAccountBalanceWallet /> },
];

export default function Layout() {
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
