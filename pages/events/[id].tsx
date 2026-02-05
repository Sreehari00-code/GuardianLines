import Head from 'next/head';
import { useRouter } from 'next/router';
import dbConnect from '../../lib/mongodb';
import Event from '../../models/Event';
import styles from '@/styles/Event.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CommentSection from '@/components/CommentSection';
import DirectMessageModal from '@/components/DirectMessageModal';
import stripe from '../../lib/stripe';
import Donation from '../../models/Donation';

export default function EventDetail({ event }: { event: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const [showDM, setShowDM] = useState(false);
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [participants, setParticipants] = useState(event.currentParticipants);
    const [mounted, setMounted] = useState(false);
    const [donationAmount, setDonationAmount] = useState(25);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            fetch(`/api/events/join?eventId=${event._id}`)
                .then(res => res.status === 401 ? { joined: false } : res.json())
                .then(data => { if (data.joined) setHasJoined(true); })
                .catch(console.error);
        }

        if (router.query.success === 'true') {
            alert('🎉 Thank you for your contribution! Your support is officially recognized.');
            router.replace(`/events/${event._id}`, undefined, { shallow: true });
        }
    }, [user, event._id, router.query.success]);

    if (router.isFallback) return (
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p style={{ fontWeight: 700, letterSpacing: '0.1em' }}>RETRIEVING INITIATIVE DATA...</p>
        </div>
    );

    const handleJoin = async () => {
        if (!user) { router.push('/login'); return; }
        setJoining(true);
        try {
            const res = await fetch('/api/events/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event._id })
            });
            if (res.ok) {
                setHasJoined(true);
                setParticipants((p: number) => p + 1);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to join');
            }
        } catch (err) {
            alert('Failed to join');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Rescind your participation from this event?')) return;
        setJoining(true);
        try {
            const res = await fetch('/api/events/join', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event._id })
            });
            if (res.ok) {
                setHasJoined(false);
                setParticipants((p: number) => p - 1);
            }
        } catch (err) {
            alert('Failed to leave');
        } finally {
            setJoining(false);
        }
    };

    const isCreator = !!(user && user.id === event.user);
    const progress = Math.min((participants / event.maxParticipants) * 100, 100);
    const isFull = participants >= event.maxParticipants;
    const isUnavailable = event.status === 'Completed' || event.status === 'Not Available' || (event.isDisabled === true);

    const handleDonate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event._id, title: event.name, amount: donationAmount }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            alert('Secure transaction pipeline failure. Please retry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>{event.name} | GuardianLines</title>
            </Head>

            <div className={styles.professionalContainer}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    <img
                        src={event.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'}
                        alt={event.name}
                        className={styles.heroImage}
                    />
                    <div className={styles.heroOverlay}>
                        <div className={styles.heroContent}>
                            <span className={styles.badge} style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
                                {event.category?.name || 'Initiative'}
                            </span>
                            <h1 className={styles.mainTitle}>{event.name}</h1>
                            <div className={styles.metaRow}>
                                <div className={styles.metaItem}>
                                    <span>📅</span>
                                    {mounted ? new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : '...'}
                                </div>
                                <div className={styles.metaItem}>
                                    <span>📍</span>
                                    {event.location}
                                </div>
                                <div className={styles.metaItem}>
                                    <span style={{ opacity: 0.5 }}>IDENTIFIER:</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{event.code}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.mainPanel}>
                        <section>
                            <h2 className={styles.sectionTitle}>Overview</h2>
                            <p className={styles.largeDescription}>{event.description}</p>
                        </section>

                        <section style={{ marginTop: '5rem' }}>
                            <h2 className={styles.sectionTitle}>Discussion Panel</h2>
                            <CommentSection eventId={event._id} />
                        </section>
                    </div>

                    <aside className={styles.stickySidebar}>
                        <div className={styles.sidebarCard}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                    <span style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Network Capacity</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>{Math.round(progress)}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600' }}>
                                    {participants} of {event.maxParticipants} slots confirmed
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                                {!hasJoined ? (
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining || isFull || isUnavailable || isCreator}
                                        style={{
                                            width: '100%',
                                            padding: '1.25rem',
                                            borderRadius: '1.25rem',
                                            border: 'none',
                                            background: (isFull || isUnavailable || isCreator) ? 'var(--glass-border)' : 'var(--foreground)',
                                            color: (isFull || isUnavailable || isCreator) ? 'var(--secondary)' : 'var(--background)',
                                            fontWeight: '800',
                                            cursor: (isFull || isUnavailable || isCreator) ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        {joining ? 'SYNCING...' : isFull ? 'REGISTRY FULL' : isUnavailable ? 'ACCESS CLOSED' : 'JOIN INITIATIVE'}
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className={styles.memberBadge}>
                                            <span>✓</span> CONFIRMED PARTICIPANT
                                        </div>
                                        <button
                                            onClick={handleLeave}
                                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#f87171', padding: '1rem', borderRadius: '1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}
                                        >
                                            RESCIND PARTICIPATION
                                        </button>
                                    </div>
                                )}

                                {isCreator ? (
                                    <div style={{ padding: '1.25rem', background: 'var(--glass-border)', color: 'var(--foreground)', borderRadius: '1rem', textAlign: 'center', fontWeight: '800', fontSize: '0.9rem', border: '1px solid var(--glass-border)' }}>
                                        👑 SYSTEM ORGANIZER
                                    </div>
                                ) : (
                                    user && (
                                        <button
                                            onClick={() => setShowDM(true)}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--foreground)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                                        >
                                            CONTACT ORGANIZER
                                        </button>
                                    )
                                )}
                            </div>

                            <div style={{ paddingTop: '2.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '800' }}>Fuel the Impact</h3>
                                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                    Provide financial support to scale this movement. Secure processing via Stripe.
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontWeight: '800' }}>$</span>
                                        <input
                                            type="number"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                                            style={{ width: '100%', padding: '1rem 1rem 1rem 2rem', background: 'var(--background)', border: '1px solid var(--glass-border)', borderRadius: '1rem', color: 'var(--foreground)', fontWeight: '700', outline: 'none' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleDonate}
                                        disabled={loading}
                                        style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0 1.5rem', borderRadius: '1rem', fontWeight: '800', cursor: 'pointer' }}
                                    >
                                        {loading ? '...' : 'CONTRIBUTE'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {user && event.user && (
                <DirectMessageModal
                    isOpen={showDM}
                    onClose={() => setShowDM(false)}
                    recipientId={event.user}
                    recipientName="Organizer"
                    eventId={event._id}
                />
            )}
        </>
    );
}

export async function getServerSideProps({ params, query }: any) {
    try {
        await dbConnect();
        const doc = await Event.findById(params.id).populate('category');
        if (!doc) return { notFound: true };

        if (query.success === 'true' && query.session_id) {
            try {
                const session = await stripe.checkout.sessions.retrieve(query.session_id);
                if (session.payment_status === 'paid') {
                    await Donation.findOneAndUpdate(
                        { stripeSessionId: query.session_id },
                        { status: 'completed' }
                    );
                }
            } catch (stripeErr) {
                console.error('Stripe verification failed:', stripeErr);
            }
        }

        return { props: { event: JSON.parse(JSON.stringify(doc)) } };
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
}
