import { useState, useEffect } from 'react';
import styles from '@/styles/Dashboard.module.css';

export default function MyDonationsView() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyDonations = async () => {
        try {
            const res = await fetch('/api/donations/my');
            if (res.ok) {
                const data = await res.json();
                setDonations(data.donations || []);
            }
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyDonations();
    }, []);

    const totalImpact = donations
        .filter(d => d.status === 'completed')
        .reduce((acc, curr) => acc + curr.amount, 0) / 100;

    if (loading) return <div style={{ color: 'var(--secondary)' }}>Loading contributions...</div>;

    return (
        <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Impact History</h2>
                <div style={{ background: 'var(--glass-bg)', padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginRight: '0.75rem' }}>Total Life Contribution:</span>
                    <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>${totalImpact.toFixed(2)}</span>
                </div>
            </div>

            {donations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--glass-bg)', borderRadius: '2rem', border: '1px dashed var(--glass-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💝</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No impact recorded yet</h3>
                    <p style={{ color: 'var(--secondary)', maxWidth: '400px', margin: '0 auto' }}>
                        When you support events through donations, your legacy of impact will be beautifully tracked here.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {donations.map(donation => (
                        <div key={donation._id} className={styles.bentoCard} style={{ flexDirection: 'row', alignItems: 'center', padding: '1.5rem 2rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '1rem',
                                background: 'var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                flexShrink: 0,
                            }}>
                                🎁
                            </div>
                            <div style={{ flex: 1, marginLeft: '1.5rem' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                                    {donation.event?.name || 'Community Support'}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                                    {new Date(donation.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                    +${(donation.amount / 100).toFixed(2)}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '50px',
                                    background: donation.status === 'completed' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: donation.status === 'completed' ? 'var(--foreground)' : '#f87171',
                                    border: '1px solid var(--glass-border)',
                                    display: 'inline-block'
                                }}>
                                    {donation.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
