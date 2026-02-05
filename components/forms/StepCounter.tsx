import styles from '@/styles/Event.module.css';

interface StepCounterProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
}

export default function StepCounter({ value, onChange, label, min = 1, max = 10000, step = 1 }: StepCounterProps) {
    const handleIncrement = () => {
        if (value + step <= max) {
            onChange(value + step);
        }
    };

    const handleDecrement = () => {
        if (value - step >= min) {
            onChange(value - step);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = min;
        if (val < min) val = min;
        if (val > max) val = max;
        onChange(val);
    };

    return (
        <div className={styles.formGroup}>
            {label && <label className={styles.label}>{label}</label>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    type="button"
                    onClick={handleDecrement}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '1rem',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(var(--foreground-rgb, 255, 255, 255), 0.04)',
                        color: 'var(--foreground)',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                    −
                </button>

                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    onBlur={handleBlur}
                    className={styles.input}
                    style={{
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        width: '120px',
                        margin: 0,
                        fontFamily: 'ui-monospace, monospace'
                    }}
                />

                <button
                    type="button"
                    onClick={handleIncrement}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '1rem',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(var(--foreground-rgb, 255, 255, 255), 0.04)',
                        color: 'var(--foreground)',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                    +
                </button>
            </div>
        </div>
    );
}
