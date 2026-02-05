import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import DonationManagement from '@/components/admin/DonationManagement';
import AdminEventsView from '@/components/admin/AdminEventsView';
import styles from '@/styles/Admin.module.css';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [view, setView] = useState('dashboard');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontWeight: '700', letterSpacing: '0.1em' }}>AUTHORIZING ADMIN ACCESS...</div>
        </div>
    );

    const renderContent = () => {
        switch (view) {
            case 'users':
                return <UserManagement />;
            case 'categories':
                return <CategoryManagement />;
            case 'events':
                return <AdminEventsView />;
            case 'donations':
                return <DonationManagement />;
            case 'dashboard':
            default:
                return (
                    <div className={styles.scrollableContent} style={{ padding: 0 }}>
                        <div style={{
                            background: 'var(--foreground)',
                            color: 'var(--background)',
                            padding: '4rem',
                            borderRadius: '2rem',
                            marginBottom: '3rem',
                        }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Systems Operational.</h1>
                            <p style={{ fontSize: '1.25rem', opacity: 0.8, fontWeight: '500' }}>Welcome to the command center. Monitor and manage the GuardianLines ecosystem.</p>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Active Users</span>
                                <span className={styles.statValue}>1.2k</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Events Moderated</span>
                                <span className={styles.statValue}>84</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Total Donations</span>
                                <span className={styles.statValue}>$42k</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Categories</span>
                                <span className={styles.statValue}>12</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                            <div className={styles.tableContainer} style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>System Integrity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {['Database Connection', 'Auth Services', 'Stripe Integration', 'Cloudinary Storage'].map((service, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--glass-border)', borderRadius: '1rem' }}>
                                            <span style={{ fontWeight: '600' }}>{service}</span>
                                            <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '800' }}>ONLINE</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.tableContainer} style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Pending Moderation</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ padding: '1.5rem', border: '1px dashed var(--glass-border)', borderRadius: '1.5rem', textAlign: 'center' }}>
                                        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>All events currently verified. No pending tasks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Admin Dashboard | GuardianLines</title>
            </Head>
            <AdminLayout activeView={view} setView={setView}>
                {renderContent()}
            </AdminLayout>
        </>
    );
}
