import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Admin.module.css';

export default function AdminLayout({ children, activeView, setView }: any) {
    const { logout, user } = useAuth();
    const router = useRouter();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'events', label: 'Events', icon: '📅' },
        { id: 'categories', label: 'Categories', icon: '🏷️' },
        { id: 'donations', label: 'Donations', icon: '💰' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2 onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>GuardianLines</h2>
                </div>

                <nav className={styles.nav}>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.15em', marginBottom: '1rem', paddingLeft: '1rem' }}>SYSTEM CORE</div>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeView === item.id ? styles.active : ''}`}
                            onClick={() => setView(item.id)}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div style={{ padding: '1.5rem', background: 'var(--glass-border)', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--foreground)', color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                A
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.username}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{user?.role.toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Terminte Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>NAVIGATING / {activeView.toUpperCase()}</div>
                        <h3>{menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* We don't necessarily need a theme toggle here if it's already in the global navbar, 
                             but the admin portal is separate. Layout already includes the background blobs 
                             if it's wrapped in Layout, but AdminPortal might be different. 
                             Looking at the pages/admin/dashboard.tsx, it uses AdminLayout, which doesn't seem to be wrapped in global Layout?
                             Wait, _app.tsx wraps EVERYTHING in Layout. Let's check.
                          */}
                        <div className={styles.userProfile}>
                            <span style={{ marginRight: '0.5rem', opacity: 0.5 }}>●</span> SYSTEM SECURE
                        </div>
                    </div>
                </header>

                <div className={styles.scrollableContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}
