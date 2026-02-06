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
    const [stats, setStats] = useState({
        activeUsers: 0,
        eventsModerated: 0,
        totalDonations: 0,
        categories: 0,
        pendingEvents: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (view === 'dashboard') {
            fetchStats();
        }
    }, [view]);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const [usersRes, eventsRes, categoriesRes, donationsRes] = await Promise.all([
                fetch('/api/auth/users'),
                fetch('/api/events/index'),
                fetch('/api/categories'),
                fetch('/api/admin/donations?limit=1000'),
            ]);

            const usersData = await usersRes.json();
            const eventsData = await eventsRes.json();
            const categoriesData = await categoriesRes.json();
            const donationsData = await donationsRes.json();

            const allEvents = eventsData.events || [];
            const activeUsers = Array.isArray(usersData) ? usersData.filter((u: any) => !u.isDisabled).length : 0;
            const pendingEvents = allEvents.filter((e: any) => e.status === 'pending').length;

            let totalDonations = 0;
            if (donationsData.donations && Array.isArray(donationsData.donations)) {
                totalDonations = donationsData.donations
                    .filter((d: any) => d.status === 'completed')
                    .reduce((sum: number, d: any) => sum + (d.amount || 0), 0) / 100;
            }

            setStats({
                activeUsers,
                eventsModerated: allEvents.length,
                totalDonations: Math.round(totalDonations),
                categories: categoriesData.categories?.length || 0,
                pendingEvents,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

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
                                <span className={styles.statValue}>{loadingStats ? '-' : stats.activeUsers}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Events Moderated</span>
                                <span className={styles.statValue}>{loadingStats ? '-' : stats.eventsModerated}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Total Donations</span>
                                <span className={styles.statValue}>{loadingStats ? '-' : `$${stats.totalDonations.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Categories</span>
                                <span className={styles.statValue}>{loadingStats ? '-' : stats.categories}</span>
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
                                        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                            {loadingStats ? 'Loading...' : stats.pendingEvents === 0 ? 'All events currently verified. No pending tasks.' : `${stats.pendingEvents} event(s) pending moderation.`}
                                        </p>
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
