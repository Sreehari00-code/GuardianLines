import Head from 'next/head';
import dbConnect from '../../lib/mongodb';
import Event from '../../models/Event';
import EventCard from '../../components/EventCard';
import styles from '@/styles/Event.module.css';
import Link from 'next/link';

export default function Events({ events }: { events: any[] }) {
    return (
        <>
            <Head>
                <title>Initiatives | GuardianLines</title>
            </Head>

            <div className={styles.container}>
                <div className={styles.header}>
                    <div className="badge" style={{ marginBottom: '1.5rem', background: 'var(--glass-border)', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-block' }}>
                        Discover Impact
                    </div>
                    <h1>Join the <span style={{ fontWeight: 400, fontStyle: 'italic' }}>Movement</span>.</h1>
                    <p>
                        Discover verified community initiatives. Whether you want to volunteer, contribute, or learn, find your path to making a difference.
                    </p>
                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <Link href="/events/create">
                            <button style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                Start an Initiative
                            </button>
                        </Link>
                        <button style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--glass-border)', padding: '1rem 2rem', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}>
                            Filter Categories
                        </button>
                    </div>
                </div>

                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'var(--glass-bg)', borderRadius: '2rem', border: '1px dashed var(--glass-border)' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No active events found.</h3>
                        <p style={{ color: 'var(--secondary)', marginBottom: '2.5rem' }}>Be the catalyst for change. Create the first movement in your area.</p>
                        <Link href="/events/create">
                            <button style={{ background: 'var(--primary)', color: 'var(--primary-invert)', border: 'none', padding: '1rem 2.5rem', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}>
                                Launch Event
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {events.map((event) => (
                            <div key={event._id} style={{ animation: 'fadeIn 0.6s ease-out' }}>
                                <EventCard event={event} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export async function getServerSideProps() {
    try {
        await dbConnect();
        const result = await Event.find({ isDisabled: { $ne: true } })
            .populate('category')
            .populate('user', 'username')
            .sort({ date: 1 });

        const events = JSON.parse(JSON.stringify(result));
        return { props: { events } };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { props: { events: [] } };
    }
}
