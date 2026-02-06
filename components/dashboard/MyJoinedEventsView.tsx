import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';
import ToastContainer, { useToast } from '@/components/Toast';

export default function MyJoinedEventsView() {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [leavingEventId, setLeavingEventId] = useState<string | null>(null);
    const { toasts, showToast, removeToast } = useToast();

    const fetchJoinedEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/events/joined/${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                const joinedEventsData = data.joinedEvents || [];
                // Map the nested event data
                const mappedEvents = joinedEventsData.map((join: any) => ({
                    ...join,
                    ...join.event,
                    _id: join.event._id
                }));
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error('Failed to fetch joined events', error);
            showToast('Failed to load joined events', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchJoinedEvents();
        }
    }, [user?.id]);

    const leaveEvent = async (eventId: string) => {
        setLeavingEventId(eventId);
        try {
            const res = await fetch('/api/events/join', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            });

            if (res.ok) {
                setEvents(events.filter(e => e._id !== eventId));
                showToast('Successfully left the event', 'success');
            } else {
                const err = await res.json();
                showToast(err.message || 'Failed to leave event', 'error');
            }
        } catch (error) {
            console.error('Error leaving event', error);
            showToast('Failed to leave event', 'error');
        } finally {
            setLeavingEventId(null);
        }
    };

    if (loading) return <div style={{ color: 'var(--secondary)' }}>Loading your joined events...</div>;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <h2 style={{ marginBottom: '2rem' }}>Events I'm Attending</h2>

            {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--glass-bg)', borderRadius: '2rem', border: '1px dashed var(--glass-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎪</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No events joined yet</h3>
                    <p style={{ color: 'var(--secondary)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                        Explore and join events in your community to make a difference.
                    </p>
                    <Link href="/events">
                        <button style={{ background: 'var(--primary)', color: 'var(--primary-invert)', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}>
                            Discover Events
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event._id} className={styles.bentoCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '0.4rem 0.8rem', background: event.isDisabled ? 'rgba(239, 68, 68, 0.1)' : 'var(--glass-border)', color: event.isDisabled ? '#f87171' : 'var(--foreground)', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid var(--glass-border)' }}>
                                    {event.isDisabled ? 'Disabled' : event.status}
                                </div>
                                <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: '600' }}>#{event.code}</span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>{event.name}</h3>

                            <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>📅</span> {new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>👥</span> {event.currentParticipants} of {event.maxParticipants} spots filled
                                </div>
                                {event.category && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>🏷️</span> {event.category.name}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                <Link href={`/events/${event._id}`} style={{ flex: 1 }}>
                                    <button style={{ width: '100%', padding: '0.75rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        Preview
                                    </button>
                                </Link>
                                <button
                                    onClick={() => leaveEvent(event._id)}
                                    disabled={leavingEventId === event._id}
                                    style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '0.75rem', fontWeight: '600', cursor: leavingEventId === event._id ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: leavingEventId === event._id ? 0.6 : 1 }}
                                >
                                    {leavingEventId === event._id ? 'Leaving...' : 'Leave'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}