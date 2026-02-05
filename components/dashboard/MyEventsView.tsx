import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';

export default function MyEventsView() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const fetchMyEvents = async () => {
        try {
            const res = await fetch('/api/events/my');
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const toggleEventStatus = async (eventId: string, currentIsDisabled: boolean) => {
        try {
            const res = await fetch(`/api/events/${eventId}/disable`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disable: !currentIsDisabled })
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(events.map(e => e._id === eventId ? { ...e, isDisabled: data.event.isDisabled, status: data.event.status } : e));
            } else {
                const err = await res.json();
                alert(err.message || 'Action failed');
            }
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const viewParticipants = async (eventId: string) => {
        setSelectedEventId(eventId);
        setLoadingParticipants(true);
        try {
            const res = await fetch(`/api/events/${eventId}/participants`);
            if (res.ok) {
                const data = await res.json();
                setParticipants(data.participants || []);
            }
        } catch (error) {
            console.error('Failed to fetch participants', error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--secondary)' }}>Loading your events...</div>;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <h2 style={{ marginBottom: '2rem' }}>My Initiatives</h2>

            {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--glass-bg)', borderRadius: '2rem', border: '1px dashed var(--glass-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎯</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No events organized yet</h3>
                    <p style={{ color: 'var(--secondary)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                        Start your journey by creating an event to help your local community.
                    </p>
                    <Link href="/events/create">
                        <button style={{ background: 'var(--primary)', color: 'var(--primary-invert)', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}>
                            Create Your First Event
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
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                <button
                                    onClick={() => viewParticipants(event._id)}
                                    style={{ flex: 1, padding: '0.75rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Participants
                                </button>
                                <Link href={`/events/${event._id}/edit`} style={{ flex: 1 }}>
                                    <button style={{ width: '100%', padding: '0.75rem', background: 'var(--glass-border)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        Edit
                                    </button>
                                </Link>
                                <button
                                    onClick={() => toggleEventStatus(event._id, event.isDisabled)}
                                    disabled={event.disabledBy === 'admin'}
                                    style={{ padding: '0.75rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', cursor: event.disabledBy === 'admin' ? 'not-allowed' : 'pointer', opacity: event.disabledBy === 'admin' ? 0.5 : 1 }}
                                >
                                    {event.isDisabled ? '👁️' : '🚫'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Participants Modal */}
            {selectedEventId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1.5rem' }}>
                    <div style={{ background: 'var(--background)', border: '1px solid var(--glass-border)', width: '100%', maxWidth: '500px', borderRadius: '2rem', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Confirmed Participants</h3>
                            <button onClick={() => setSelectedEventId(null)} style={{ background: 'var(--glass-border)', border: 'none', color: 'var(--foreground)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>&times;</button>
                        </div>

                        {loadingParticipants ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>Fetching attendee list...</div>
                        ) : participants.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>No one has signed up yet. Keep spreading the word!</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {participants.map(p => (
                                    <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1.25rem', background: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}>
                                        <img src={p.profilePicture || 'https://via.placeholder.com/48'} alt={p.username} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{p.username}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{p.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
