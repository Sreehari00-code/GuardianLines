import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import ToastContainer, { useToast } from '@/components/Toast';
import styles from '@/styles/Dashboard.module.css';

export default function ProfileView() {
    const { user, login } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { toasts, showToast, removeToast } = useToast();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, profilePicture })
            });

            if (res.ok) {
                const data = await res.json();
                login(data.user);
                setMessage('Profile updated successfully!');
            } else {
                const data = await res.json();
                setMessage(data.message || 'Update failed');
            }
        } catch (error) {
            setMessage('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('CRITICAL: This will permanently delete your account and all associated data. This cannot be undone. Proceed?')) return;

        try {
            const res = await fetch('/api/auth/profile', { method: 'DELETE' });
            if (res.ok) window.location.href = '/';
        } catch (error) {
            showToast('Something went wrong', 'error');
        }
    };

    return (
        <div className={styles.bentoCard} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <h2 style={{ marginBottom: '2rem' }}>Account Settings</h2>

            <div className={styles.dashboardGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 2rem' }}>
                        <img
                            src={profilePicture || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--glass-border)', padding: '4px' }}
                        />
                    </div>
                    <ImageUpload
                        onUpload={setProfilePicture}
                        currentImage={profilePicture}
                        label="Change Photo"
                    />
                </div>

                <div>
                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '600' }}>DISPLAY NAME</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                style={{ background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '1rem', borderRadius: '1rem', width: '100%', outline: 'none' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '600' }}>EMAIL ADDRESS</label>
                            <input
                                type="email"
                                className={styles.inputField}
                                style={{ background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '1rem', borderRadius: '1rem', width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                                value={user?.email || ''}
                                disabled
                            />
                        </div>

                        {message && (
                            <div style={{ padding: '1rem', borderRadius: '1rem', background: message.includes('success') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.05)', color: message.includes('success') ? 'var(--foreground)' : '#f87171', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ background: 'var(--primary)', color: 'var(--primary-invert)', border: 'none', padding: '1rem 2rem', borderRadius: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '1rem' }}
                        >
                            {loading ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                    </form>

                    <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1.5rem', background: 'rgba(239, 68, 68, 0.02)' }}>
                        <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Danger Zone</h4>
                        <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Permanently delete your account and all associated data.
                        </p>
                        <button onClick={handleDelete} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
