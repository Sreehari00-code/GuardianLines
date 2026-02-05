import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Event.module.css';
import ImageUpload from '@/components/ImageUpload';
import CustomSelect from '@/components/forms/CustomSelect';
import CustomDatePicker from '@/components/forms/CustomDatePicker';
import StepCounter from '@/components/forms/StepCounter';

export default function EditEvent() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: '',
        image: '',
        category: '',
        maxParticipants: '',
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Fetch Event Data
        fetch(`/api/events/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const e = data.event;
                    setFormData({
                        name: e.name || '',
                        description: e.description || '',
                        date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
                        location: e.location || '',
                        image: e.image || '',
                        category: e.category?._id || e.category || '',
                        maxParticipants: e.maxParticipants || '',
                    });
                }
                setLoading(false);
            });

        // Fetch categories
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.categories);
            });
    }, [id]);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.push(`/events/${id}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            alert('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontWeight: '800', letterSpacing: '0.1em' }}>ACCESSING REGISTRY RECORDS...</div>
        </div>
    );

    return (
        <div className={styles.container}>
            <Head>
                <title>Modify Movement | GuardianLines</title>
            </Head>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div className={styles.badge}>
                        Administrative Registry
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1', marginBottom: '1rem' }}>Synchronize <span style={{ fontStyle: 'italic', fontWeight: '400' }}>Changes</span></h1>
                    <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Update the parameters of your active movement. Real-time updates ensure your community stays accurately informed.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.6s ease-out' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                        {/* Basic Information */}
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '2.5rem', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Core Records
                            </h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>INITIATIVE NAME</label>
                                <input name="name" value={formData.name} required className={styles.input} onChange={handleChange} placeholder="e.g. Wildlife Preservation Workshop" />
                            </div>

                            <CustomSelect
                                label="CATEGORY"
                                options={categories}
                                value={formData.category}
                                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                placeholder="Select Category"
                            />

                            <div className={styles.formGroup}>
                                <label className={styles.label}>IDENTIFIED LOCATION</label>
                                <input name="location" value={formData.location} required className={styles.input} onChange={handleChange} placeholder="City, Region or Virtual" />
                            </div>
                        </div>

                        {/* Logistics */}
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '2.5rem', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Vital Logistics
                            </h3>

                            <CustomDatePicker
                                label="UPDATED DATE"
                                value={formData.date}
                                onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                            />

                            <StepCounter
                                label="ADJUST CAPACITY"
                                value={parseInt(formData.maxParticipants as string) || 0}
                                onChange={(val) => setFormData(prev => ({ ...prev, maxParticipants: val.toString() }))}
                            />

                            <div className={styles.formGroup}>
                                <label className={styles.label}>MEDIA ASSET (COVER)</label>
                                <ImageUpload
                                    label="Replace Image"
                                    currentImage={formData.image}
                                    onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                />
                            </div>
                        </div>

                        {/* Description - Full Width */}
                        <div style={{ gridColumn: '1 / -1', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Revised Mission Statement
                            </h3>
                            <div className={styles.formGroup} style={{ margin: 0 }}>
                                <label className={styles.label}>DESCRIBE THE UPDATED IMPACT AND EXPECTATIONS</label>
                                <textarea name="description" value={formData.description} className={styles.textarea} style={{ minHeight: '180px' }} onChange={handleChange} placeholder="Clarify the mission, goals, and required preparation for participants..." />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <button type="button" onClick={() => router.back()} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '1rem 3rem', borderRadius: '50px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                            DISCARD
                        </button>
                        <button type="submit" disabled={saving} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '1rem 4rem', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' }}>
                            {saving ? 'SYNCHRONIZING...' : 'SYNCHRONIZE CHANGES'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
