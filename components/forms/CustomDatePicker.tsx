import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/Event.module.css';

interface CustomDatePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

export default function CustomDatePicker({ value, onChange, label, placeholder = "Select Date" }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isPast = (day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const current = new Date(year, month, day);
        return current < today;
    };

    const handleSelectDay = (day: number) => {
        if (isPast(day)) return;
        const selectedDate = new Date(year, month, day);
        // Format as YYYY-MM-DD manually to avoid timezone shifts
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const selectedDateObj = value ? new Date(value) : null;
    const isSelected = (day: number) => {
        if (!selectedDateObj) return false;
        // Adjust for timezone when comparing if needed, but since value is YYYY-MM-DD
        const d = new Date(value + 'T00:00:00'); // Parse as local
        return d.getDate() === day &&
            d.getMonth() === month &&
            d.getFullYear() === year;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
    };

    return (
        <div className={styles.formGroup} ref={dropdownRef} style={{ position: 'relative' }}>
            {label && <label className={styles.label}>{label}</label>}

            <div
                className={styles.input}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isOpen ? 'rgba(var(--foreground-rgb), 0.08)' : 'rgba(var(--foreground-rgb), 0.04)',
                    borderColor: isOpen ? 'var(--primary)' : 'var(--glass-border)'
                }}
            >
                <span style={{ color: value ? 'var(--foreground)' : 'var(--secondary)', opacity: value ? 1 : 0.6 }}>
                    {value ? new Date(value + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase() : placeholder.toUpperCase()}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" opacity="0.6">
                    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {isOpen && (
                <div
                    className="glass"
                    style={{
                        position: 'absolute',
                        top: label ? 'calc(100% - 0.5rem)' : '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        marginTop: '0.5rem',
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        animation: 'fadeIn 0.2s ease-out',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        border: '1px solid var(--glass-border)',
                        width: '320px',
                        background: 'var(--background)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <button type="button" onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', padding: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.05em', color: 'var(--foreground)' }}>
                            {months[month].toUpperCase()} {year}
                        </div>
                        <button type="button" onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', padding: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.4, color: 'var(--foreground)' }}>{day}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const day = i + 1;
                            const active = isSelected(day);
                            const today = isToday(day);
                            const disabled = isPast(day);
                            return (
                                <div
                                    key={day}
                                    onClick={() => !disabled && handleSelectDay(day)}
                                    style={{
                                        height: '35px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.85rem',
                                        fontWeight: active ? '800' : '500',
                                        background: active ? 'var(--foreground)' : 'transparent',
                                        color: active ? 'var(--background)' : (disabled ? 'var(--secondary)' : 'var(--foreground)'),
                                        opacity: disabled ? 0.3 : 1,
                                        border: today && !active ? '1px solid var(--primary)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active && !disabled) e.currentTarget.style.background = 'rgba(var(--foreground-rgb), 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active && !disabled) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
