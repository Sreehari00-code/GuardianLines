import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import ProfileView from '@/components/dashboard/ProfileView';
import MyEventsView from '@/components/dashboard/MyEventsView';
import MyJoinedEventsView from '@/components/dashboard/MyJoinedEventsView';
import MyDonationsView from '@/components/dashboard/MyDonationsView';
import MessagesView from '@/components/dashboard/MessagesView';
import styles from '@/styles/Dashboard.module.css';

export default function UserDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [view, setView] = useState('overview');

    useEffect(() => {
        if (router.query.view) {
            setView(router.query.view as string);
        }
    }, [router.query.view]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
            <div style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 600 }}>Syncing your dashboard...</div>
        </div>
    );

    const renderContent = () => {
        switch (view) {
            case 'events': return <MyEventsView />;
            case 'joined': return <MyJoinedEventsView />;
            case 'donations': return <MyDonationsView />;
            case 'messages': return <MessagesView />;
            case 'settings': return <ProfileView />;
            case 'overview':
            default: return <Overview user={user} setView={setView} />;
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'events', label: 'Events', icon: '🎯' },
        { id: 'joined', label: 'Joined', icon: '🎪' },
        { id: 'donations', label: 'Impact', icon: '💖' },
        { id: 'messages', label: 'Messages', icon: '💬' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <>
            <Head>
                <title>Dashboard | GuardianLines</title>
            </Head>
            <div className={styles.container}>
                <header className={styles.dashboardHeader}>
                    <div className={styles.welcome}>
                        <p>Welcome back,</p>
                        <h1>{user.username}</h1>
                    </div>

                    <div className={styles.tabs}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tab} ${view === tab.id ? styles.active : ''}`}
                                onClick={() => setView(tab.id)}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                        <button onClick={logout} className={styles.tab} style={{ color: '#ef4444' }}>
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </header>

                <div className={styles.mainViewArea}>
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

function Overview({ user, setView }: { user: any, setView: (v: string) => void }) {
    const [stats, setStats] = useState({
        totalDonations: 0,
        eventsJoined: 0,
        messages: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch donations
                const donationsRes = await fetch('/api/donations/my');
                let totalDonations = 0;
                if (donationsRes.ok) {
                    const donationsData = await donationsRes.json();
                    const donations = donationsData.donations || [];
                    totalDonations = donations
                        .filter((d: any) => d.status === 'completed')
                        .reduce((acc: number, curr: any) => acc + curr.amount, 0) / 100;
                }

                // Fetch events
                const eventsRes = await fetch('/api/events/my');
                let eventsJoined = 0;
                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    eventsJoined = (eventsData.events || []).length;
                }

                // Fetch messages/conversations
                const messagesRes = await fetch('/api/messages');
                let unreadCount = 0;
                if (messagesRes.ok) {
                    const messagesData = await messagesRes.json();
                    const conversations = messagesData.conversations || [];
                    unreadCount = conversations.filter((conv: any) => conv.unread).length;
                }

                setStats({
                    totalDonations,
                    eventsJoined,
                    messages: unreadCount,
                    loading: false
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    return (
        <div className={styles.bentoGrid}>
            {/* Compact Profile Card - Horizontal */}
            <div className={styles.bentoCard} style={{ gridColumn: 'span 12', padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: '1 1 300px' }}>
                        <img
                            src={user.profilePicture || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                        />
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontWeight: '800' }}>{user.username}</h2>
                            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{user.email}</p>
                            <div style={{ display: 'inline-block', padding: '0.35rem 0.85rem', background: 'var(--glass-border)', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {user.role} Member
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setView('settings')}
                        style={{ padding: '0.75rem 1.75rem', background: 'var(--primary)', color: 'var(--primary-invert)', border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Compact Stats Grid */}
            <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {/* Initiatives Card */}
                <div className={styles.bentoCard} style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initiatives</span>
                        <div style={{ fontSize: '1.25rem' }}>🎯</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                        {stats.loading ? '...' : stats.eventsJoined}
                    </div>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>Events created</div>
                    <button onClick={() => setView('events')} style={{ background: 'none', border: 'none', color: 'var(--foreground)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>View activities →</button>
                </div>

                {/* Messages Card */}
                <div className={styles.bentoCard} style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Messages</span>
                        <div style={{ fontSize: '1.25rem' }}>💬</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                        {stats.loading ? '...' : stats.messages}
                    </div>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>Unread notifications</div>
                    <button onClick={() => setView('messages')} style={{ background: 'none', border: 'none', color: 'var(--foreground)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>Open inbox →</button>
                </div>

                {/* Impact Card */}
                <div className={styles.bentoCard} style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impact</span>
                        <div style={{ fontSize: '1.25rem' }}>💖</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800' }}>
                            {stats.loading ? '...' : `$${stats.totalDonations.toFixed(2)}`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: stats.totalDonations > 0 ? '#4ade80' : 'var(--secondary)', fontWeight: '600' }}>
                            {stats.totalDonations > 0 ? '✓' : '—'}
                        </div>
                    </div>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>Total contributions</div>
                    <button onClick={() => setView('donations')} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem', width: '100%' }}>History</button>
                </div>
            </div>

            {/* Compact Quick Actions */}
            <div className={styles.bentoCard} style={{ gridColumn: 'span 12', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--secondary)' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button onClick={() => window.location.href = '/events'} style={{ padding: '1rem', background: 'var(--glass-border)', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
                        <h4 style={{ marginBottom: '0.25rem', fontSize: '0.95rem', fontWeight: '700' }}>Find Events</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Discover opportunities</p>
                    </button>
                    <button onClick={() => window.location.href = '/events/create'} style={{ padding: '1rem', background: 'var(--glass-border)', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
                        <h4 style={{ marginBottom: '0.25rem', fontSize: '0.95rem', fontWeight: '700' }}>Start Initiative</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Create your event</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
