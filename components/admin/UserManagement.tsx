import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (user: any) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} this user?`)) return;

        try {
            const res = await fetch(`/api/auth/user/${user._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive })
            });
            if (res.ok) fetchUsers();
            else alert('Failed to update status');
        } catch (error) {
            console.error(error);
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user PERMANENTLY?')) return;

        try {
            const res = await fetch(`/api/auth/user/${id}`, { method: 'DELETE' });
            if (res.ok) fetchUsers();
            else alert('Failed to delete user');
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1.5rem' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className={styles.input}
                        style={{ paddingLeft: '3rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={fetchUsers} className={styles.actionBtn} style={{ background: 'var(--primary)', color: 'var(--primary-invert)', margin: 0, padding: '0.9rem 2rem' }}>
                    Refresh Database
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>IDENTIFIER</th>
                            <th>EMAIL ADDRESS</th>
                            <th>ROLE</th>
                            <th>STATUS</th>
                            <th>OPERATIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>Syncing user data...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>No matching users found.</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user._id} style={{ opacity: user.isActive ? 1 : 0.6 }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--glass-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            {user.profilePicture ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                        </div>
                                        <span style={{ fontWeight: '700' }}>{user.username}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.isActive ? '#4ade80' : '#f87171' }}></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: user.isActive ? 'var(--foreground)' : 'var(--secondary)' }}>
                                            {user.isActive ? 'Active' : 'Locked'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className={styles.actionBtn}
                                            style={{
                                                background: user.isActive ? 'var(--foreground)' : 'var(--background)',
                                                color: user.isActive ? 'var(--background)' : 'var(--foreground)',
                                                border: '1px solid var(--glass-border)'
                                            }}
                                            onClick={() => toggleStatus(user)}
                                        >
                                            {user.isActive ? 'Suspend' : 'Reinstate'}
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.btnDelete}`}
                                            onClick={() => deleteUser(user._id)}
                                        >
                                            Purge
                                        </button>
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
