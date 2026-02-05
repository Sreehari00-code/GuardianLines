import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function CategoryManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const createCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory })
            });
            if (res.ok) {
                setNewCategory('');
                fetchCategories();
            } else {
                alert('Failed to create category');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async (cat: any) => {
        try {
            const res = await fetch(`/api/admin/categories/${cat._id}/disable`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disable: cat.isActive })
            });
            if (res.ok) fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const updateName = async (id: string, newName: string) => {
        try {
            await fetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    placeholder="Enter new category name..."
                    className={styles.input}
                    style={{ marginBottom: 0, flex: 1 }}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <button onClick={createCategory} className={styles.actionBtn} style={{ background: 'var(--primary)', color: 'var(--primary-invert)', height: '100%', padding: '0 2rem', margin: 0 }}>
                    Register Category
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>CATEGORY IDENTIFIER</th>
                            <th>STATUS</th>
                            <th>OPERATIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>Accessing category records...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>Registry is empty.</td></tr>
                        ) : categories.map(cat => (
                            <tr key={cat._id} style={{ opacity: cat.isActive ? 1 : 0.6 }}>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={cat.name}
                                        onBlur={(e) => {
                                            if (e.target.value !== cat.name) updateName(cat._id, e.target.value);
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', width: '100%', fontSize: '1.1rem', fontWeight: '700', outline: 'none' }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>ID: {cat._id}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.isActive ? '#4ade80' : '#f87171' }}></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: cat.isActive ? 'var(--foreground)' : '#f87171' }}>
                                            {cat.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className={styles.actionBtn}
                                        style={{
                                            background: cat.isActive ? 'var(--foreground)' : 'var(--background)',
                                            color: cat.isActive ? 'var(--background)' : 'var(--foreground)',
                                            border: '1px solid var(--glass-border)',
                                            width: '120px'
                                        }}
                                        onClick={() => toggleStatus(cat)}
                                    >
                                        {cat.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
