import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/Dashboard.module.css';

interface DirectMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    recipientName: string;
    eventId: string;
}

export default function DirectMessageModal({ isOpen, onClose, recipientId, recipientName, eventId }: DirectMessageModalProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/messages/${recipientId}?event=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, recipientId, eventId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient: recipientId, event: eventId, text })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setText('');
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
            <div style={{ background: 'var(--background)', border: '1px solid var(--glass-border)', width: '100%', maxWidth: '450px', height: '600px', display: 'flex', flexDirection: 'column', borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)' }}>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Secure Channel</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>TO: {recipientName.toUpperCase()}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--glass-border)', border: 'none', color: 'var(--foreground)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>&times;</button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem opacity: 0.5' }}>💬</div>
                            Establish communication with the organizer.
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMine = msg.sender._id === recipientId ? false : true;
                            return (
                                <div key={i} style={{
                                    maxWidth: '80%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: isMine ? '1.5rem 1.5rem 0 1.5rem' : '0 1.5rem 1.5rem 1.5rem',
                                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                                    background: isMine ? 'var(--primary)' : 'var(--glass-border)',
                                    color: isMine ? 'var(--primary-invert)' : 'var(--foreground)',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    position: 'relative',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.text}
                                    {isMine && (
                                        <span style={{
                                            fontSize: '0.6rem',
                                            marginLeft: '0.75rem',
                                            opacity: 0.6,
                                            fontWeight: '800'
                                        }}>
                                            {msg.isRead ? 'READ' : 'SENT'}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type an encrypted message..."
                            style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '0.875rem 1.25rem', borderRadius: '1rem', outline: 'none', fontSize: '0.95rem' }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !text.trim()}
                            style={{ background: 'var(--primary)', color: 'var(--primary-invert)', border: 'none', width: '48px', height: '48px', borderRadius: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', flexShrink: 0 }}
                        >
                            {loading ? '...' : '→'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
