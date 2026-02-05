import Link from 'next/link';
import styles from '@/styles/Event.module.css';

interface EventCardProps {
    event: any;
}

export default function EventCard({ event }: EventCardProps) {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const openSlots = Math.max(0, event.maxParticipants - (event.currentParticipants || 0));

    return (
        <Link href={`/events/${event._id}`}>
            <div className={styles.card}>
                <div className={styles.imageContainer}>
                    <img
                        src={event.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'}
                        alt={event.name}
                        className={styles.image}
                    />
                    <div className={styles.statusBadge}>
                        {event.status}
                    </div>
                </div>
                <div className={styles.content}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={styles.catBadge}>{event.category?.name || 'General'}</span>
                    </div>

                    <span className={styles.date}>📅 {formattedDate}</span>
                    <h3 className={styles.title}>{event.name}</h3>

                    <p className={styles.description}>{event.description}</p>

                    <div className={styles.footer}>
                        <div className={styles.slots}>
                            <span style={{ color: openSlots > 0 ? 'var(--foreground)' : '#f87171' }}>
                                {openSlots > 0 ? `${openSlots} slots remaining` : 'Event Full'}
                            </span>
                        </div>
                        <span className={styles.detailsBtn}>
                            DETAILS <span>→</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
