import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function DonationManagement() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchDonations = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/donations?page=${pageNumber}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setDonations(data.donations || []);
                setPage(data.currentPage);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations(page);
    }, [page]);

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Contribution Ledger</h2>
                <p style={{ color: 'var(--secondary)' }}>Audit and monitor all platform-wide financial transactions.</p>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>TIMESTAMP</th>
                            <th>CONTRIBUTOR</th>
                            <th>INITIATIVE</th>
                            <th>AMOUNT</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>Accessing ledger records...</td></tr>
                        ) : donations.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>No transactions found in this period.</td></tr>
                        ) : donations.map(donation => (
                            <tr key={donation._id}>
                                <td style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600' }}>
                                    {new Date(donation.createdAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                                <td>
                                    {donation.user ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--foreground)', color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                                {donation.user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{donation.user.username}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{donation.user.email}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span style={{ fontStyle: 'italic', color: 'var(--secondary)', fontSize: '0.9rem' }}>Anonymous Contributor</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {donation.event?.name || 'Archived Initiative'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontFamily: 'monospace' }}>#{donation.event?.code || 'N/A'}</div>
                                </td>
                                <td style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                                    ${(donation.amount / 100).toFixed(2)}
                                </td>
                                <td>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '50px',
                                        background: donation.status === 'completed' ? 'var(--foreground)' : 'var(--glass-border)',
                                        color: donation.status === 'completed' ? 'var(--background)' : 'var(--secondary)',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        letterSpacing: '0.05em'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: donation.status === 'completed' ? '#4ade80' : donation.status === 'pending' ? '#fbbf24' : '#f87171' }}></div>
                                        {donation.status.toUpperCase()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
                <button
                    className={styles.actionBtn}
                    disabled={page <= 1 || loading}
                    onClick={() => setPage(p => p - 1)}
                    style={{ margin: 0, background: 'var(--glass-border)', opacity: page <= 1 ? 0.3 : 1 }}
                >
                    ← Previous
                </button>
                <div style={{ fontWeight: '800', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
                    PAGE {page} OF {totalPages}
                </div>
                <button
                    className={styles.actionBtn}
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage(p => p + 1)}
                    style={{ margin: 0, background: 'var(--glass-border)', opacity: page >= totalPages ? 0.3 : 1 }}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
