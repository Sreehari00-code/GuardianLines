import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';
import Link from 'next/link';

export default function AdminEventsView() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (err) {
            console.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const toggleEventStatus = async (eventId: string, currentIsDisabled: boolean) => {
        const nextStatus = !currentIsDisabled;

        try {
            const res = await fetch(`/api/events/${eventId}/disable`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disable: nextStatus })
            });
            const data = await res.json();

            if (res.ok) {
                fetchEvents();
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (err) {
            alert('Error toggling event status');
        }
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ color: 'var(--secondary)' }}>Syncing platform events...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Platform Moderation</h2>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search initiatives by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.input}
                        style={{ paddingLeft: '3rem', marginBottom: 0 }}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>INITIATIVE</th>
                            <th>MODERATION CODE</th>
                            <th>ORGANIZER</th>
                            <th>VISIBILITY</th>
                            <th>OPERATIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>No events found in the database.</td></tr>
                        ) : filteredEvents.map(event => (
                            <tr key={event._id} style={{ opacity: event.isDisabled ? 0.6 : 1 }}>
                                <td>
                                    <div style={{ fontWeight: '700' }}>{event.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{event.category?.name || 'Uncategorized'}</div>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>{event.code}</td>
                                <td style={{ color: 'var(--secondary)' }}>{event.user?.username || 'Legacy System'}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: event.isDisabled ? '#f87171' : '#4ade80' }}></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: event.isDisabled ? '#f87171' : 'var(--foreground)' }}>
                                            {event.isDisabled ? `LOCKED (${event.disabledBy})` : 'PUBLIC'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => toggleEventStatus(event._id, event.isDisabled)}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                borderRadius: '0.75rem',
                                                border: '1px solid var(--glass-border)',
                                                background: event.isDisabled ? 'var(--foreground)' : 'transparent',
                                                color: event.isDisabled ? 'var(--background)' : 'var(--foreground)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {event.isDisabled ? 'Reinstate' : 'Moderate'}
                                        </button>
                                        <Link href={`/events/${event._id}`}>
                                            <button className={styles.actionBtn} style={{ background: 'var(--glass-border)', color: 'var(--foreground)', margin: 0 }}>View</button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
