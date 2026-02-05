import Link from 'next/link';
import styles from './Navbar.module.css';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className={`${styles.nav} glass`}>
            <div className={styles.logo}>
                <Link href="/">GuardianLines</Link>
            </div>

            {/* Desktop Links */}
            <div className={styles.links}>
                <Link href="/" className={styles.link}>Home</Link>
                <Link href="/events" className={styles.link}>Events</Link>
                {user && (
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className={styles.link}>
                        {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                    </Link>
                )}
            </div>

            <div className={styles.actions} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ThemeToggle />
                {user ? (
                    <>
                        <span style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Hi, {user.username}</span>
                        <button
                            onClick={logout}
                            className={styles.cta}
                            style={{ background: 'var(--glass-border)', color: 'var(--foreground)', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className={styles.link}>Login</Link>
                        <Link href="/signup" className={styles.cta}>
                            Join
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
