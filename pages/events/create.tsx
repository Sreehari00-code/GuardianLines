import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Event.module.css';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import CustomSelect from '@/components/forms/CustomSelect';
import CustomDatePicker from '@/components/forms/CustomDatePicker';
import StepCounter from '@/components/forms/StepCounter';

export default function CreateEvent() {
    const router = useRouter();
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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.categories);
                    if (data.categories.length > 0) {
                        setFormData(prev => ({ ...prev, category: data.categories[0]._id }));
                    }
                }
            });
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create event');

            router.push('/events');
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontWeight: '800', letterSpacing: '0.1em' }}>AUTHORIZING SESSION...</div>
        </div>
    );

    return (
        <div className={styles.container}>
            <Head>
                <title>Initiate Movement | GuardianLines</title>
            </Head>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div className={styles.badge}>
                        Platform Registry
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1', marginBottom: '1rem' }}>Initiate a <span style={{ fontStyle: 'italic', fontWeight: '400' }}>Movement</span></h1>
                    <p style={{ color: 'var(--secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Register your community initiative on our verified network. Accurate data ensures higher engagement.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.6s ease-out' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                        {/* Basic Information */}
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '2.5rem', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Core Registry
                            </h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>INITIATIVE NAME</label>
                                <input name="name" required className={styles.input} onChange={handleChange} placeholder="e.g. Wildlife Preservation Workshop" />
                            </div>

                            <CustomSelect
                                label="CATEGORY"
                                options={categories.filter(cat => cat.isActive)}
                                value={formData.category}
                                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                placeholder="Select Category"
                            />

                            <div className={styles.formGroup}>
                                <label className={styles.label}>IDENTIFIED LOCATION</label>
                                <input name="location" required className={styles.input} onChange={handleChange} placeholder="City, Region or Virtual" />
                            </div>
                        </div>

                        {/* Logistics */}
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '2.5rem', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Logistics & Capacity
                            </h3>

                            <CustomDatePicker
                                label="EXECUTION DATE"
                                value={formData.date}
                                onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                            />

                            <StepCounter
                                label="CAPACITY (PARTICIPANTS)"
                                value={parseInt(formData.maxParticipants as string) || 0}
                                onChange={(val) => setFormData(prev => ({ ...prev, maxParticipants: val.toString() }))}
                            />

                            <div className={styles.formGroup}>
                                <label className={styles.label}>MEDIA ASSET (COVER)</label>
                                <ImageUpload
                                    label="Upload JPG/PNG"
                                    onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                />
                            </div>
                        </div>

                        {/* Description - Full Width */}
                        <div style={{ gridColumn: '1 / -1', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Mission Statement
                            </h3>
                            <div className={styles.formGroup} style={{ margin: 0 }}>
                                <label className={styles.label}>DESCRIBE THE IMPACT AND EXPECTATIONS</label>
                                <textarea name="description" className={styles.textarea} style={{ minHeight: '180px' }} onChange={handleChange} placeholder="Establish the mission, goals, and required preparation for participants..." />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <button type="button" onClick={() => router.back()} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '1rem 3rem', borderRadius: '50px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                            ABORT
                        </button>
                        <button type="submit" disabled={loading} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '1rem 4rem', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' }}>
                            {loading ? 'SYNCHRONIZING...' : 'LAUNCH INITIATIVE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
