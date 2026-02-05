import { useState, useEffect } from 'react';
import styles from '@/styles/Dashboard.module.css';

export default function MessagesView() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConv) {
            const interval = setInterval(() => {
                fetchMessages(selectedConv);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedConv]);

    const fetchMessages = async (conv: any) => {
        setSelectedConv(conv);
        try {
            const res = await fetch(`/api/messages/${conv.otherUser._id}?event=${conv.event._id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                fetchConversations();
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedConv) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: selectedConv.otherUser._id,
                    event: selectedConv.event._id,
                    text: replyText
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setReplyText('');
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.1em' }}>
            SYNCING SECURE COMMUNICATIONS...
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', height: '650px', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Sidebar: Conversations */}
            <div className={styles.bentoCard} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>NETWORK</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '800' }}>{conversations.length} CHANNELS</span>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {conversations.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}> Registry is empty. </div>
                    ) : (
                        conversations.map((conv, i) => (
                            <div
                                key={i}
                                onClick={() => fetchMessages(conv)}
                                style={{
                                    padding: '1.5rem 2rem',
                                    borderBottom: '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    background: selectedConv?.otherUser._id === conv.otherUser._id && selectedConv?.event._id === conv.event._id ? 'var(--foreground)' : 'transparent',
                                    color: selectedConv?.otherUser._id === conv.otherUser._id && selectedConv?.event._id === conv.event._id ? 'var(--background)' : 'var(--foreground)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--glass-border)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                                            <img src={conv.otherUser.profilePicture || `https://ui-avatars.com/api/?name=${conv.otherUser.username}&background=random`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        {conv.unread && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%', border: '2px solid var(--background)' }}></div>}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {conv.otherUser.username.toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {conv.event.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={styles.bentoCard} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedConv ? (
                    <>
                        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--foreground)', color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                                    {selectedConv.otherUser.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{selectedConv.otherUser.username}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '700' }}>MISSION: {selectedConv.event.name.toUpperCase()}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#4ade80', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                                SECURE CHANNEL
                            </div>
                        </div>

                        <div ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }} style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {messages.map((msg, i) => {
                                const isMine = msg.sender._id !== selectedConv.otherUser._id;
                                return (
                                    <div key={i} style={{
                                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                                        background: isMine ? 'var(--foreground)' : 'var(--glass-border)',
                                        color: isMine ? 'var(--background)' : 'var(--foreground)',
                                        padding: '1.25rem 1.5rem',
                                        borderRadius: isMine ? '1.5rem 1.5rem 0 1.5rem' : '0 1.5rem 1.5rem 1.5rem',
                                        maxWidth: '70%',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        lineHeight: '1.5',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}>
                                        {msg.text}
                                        {isMine && (
                                            <div style={{ fontSize: '0.6rem', fontWeight: '800', marginTop: '0.5rem', opacity: 0.6, textAlign: 'right' }}>
                                                {msg.isRead ? 'AUTHENTICATED/READ' : 'DISPATCHED'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSend} style={{ padding: '2rem 2.5rem', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Enter encrypted transmission..."
                                    style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '1.25rem 1.5rem', borderRadius: '1.25rem', outline: 'none', fontWeight: '500', fontSize: '1rem' }}
                                />
                                <button
                                    disabled={sending || !replyText.trim()}
                                    style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0 2.5rem', borderRadius: '1.25rem', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', letterSpacing: '0.05em' }}
                                >
                                    {sending ? '...' : 'TRANSMIT'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '2rem', opacity: 0.1 }}>💬</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>Secure Registry Inbox</h3>
                        <p style={{ color: 'var(--secondary)', maxWidth: '350px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                            Initialize a session by selecting a transmission channel from the directory.
                        </p>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
