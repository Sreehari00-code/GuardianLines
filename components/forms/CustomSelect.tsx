import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/Event.module.css';

interface Option {
    _id: string;
    name: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Select an option", label }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt._id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setIsOpen(false);
        setSearchTerm('');
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
                    background: isOpen ? 'var(--glass-bg)' : 'rgba(var(--foreground-rgb, 255, 255, 255), 0.04)',
                    borderColor: isOpen ? 'var(--primary)' : 'var(--glass-border)'
                }}
            >
                <span style={{ color: selectedOption ? 'var(--foreground)' : 'var(--secondary)', opacity: selectedOption ? 1 : 0.6 }}>
                    {selectedOption ? selectedOption.name.toUpperCase() : placeholder.toUpperCase()}
                </span>
                <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', opacity: 0.6, color: 'var(--foreground)' }}
                >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--background)'
                    }}
                >
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                background: 'var(--glass-bg)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                color: 'var(--foreground)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option._id}
                                    onClick={() => handleSelect(option._id)}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        cursor: 'pointer',
                                        background: value === option._id ? 'var(--glass-border)' : 'transparent',
                                        transition: 'background 0.2s',
                                        fontSize: '0.9rem',
                                        fontWeight: value === option._id ? '700' : '500',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: 'var(--foreground)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = value === option._id ? 'var(--glass-border)' : 'transparent'}
                                >
                                    <span>{option.name.toUpperCase()}</span>
                                    {value === option._id && (
                                        <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
