import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Event.module.css';

interface CommentProps {
    comment: any;
    allComments: any[];
    onReply: (text: string, parentId: string) => Promise<void>;
    user: any;
    depth: number;
}

function SingleComment({ comment, allComments, onReply, user, depth }: CommentProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    const replies = allComments.filter(c => c.parentId === comment._id);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        setLoading(true);
        await onReply(replyText, comment._id);
        setReplyText('');
        setIsReplying(false);
        setLoading(false);
    };

    return (
        <div style={{
            marginBottom: '1.5rem',
            borderLeft: depth > 0 ? '2px solid var(--glass-border)' : 'none',
            paddingLeft: depth > 0 ? '1.5rem' : '0',
            marginTop: depth === 0 ? '2.5rem' : '1rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: depth === 0 ? '44px' : '32px', height: depth === 0 ? '44px' : '32px', borderRadius: '12px', background: 'var(--glass-border)', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                        src={comment.user?.profilePicture || `https://ui-avatars.com/api/?name=${comment.user?.username}&background=random`}
                        alt={comment.user?.username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '800', fontSize: depth === 0 ? '1rem' : '0.9rem', color: 'var(--foreground)' }}>{comment.user?.username}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '700' }}>
                            {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <p style={{ color: 'var(--foreground)', fontSize: depth === 0 ? '1.05rem' : '0.95rem', lineHeight: '1.6', fontWeight: '500' }}>{comment.text}</p>

                    {user && (
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--secondary)',
                                fontSize: '0.75rem',
                                padding: '0.5rem 0',
                                cursor: 'pointer',
                                fontWeight: '800',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}
                        >
                            Reply
                        </button>
                    )}

                    {isReplying && (
                        <div style={{ marginTop: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Your perspective..."
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--background)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '1rem',
                                    color: 'var(--foreground)',
                                    fontSize: '0.95rem',
                                    minHeight: '80px',
                                    marginBottom: '0.75rem',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleReplySubmit}
                                    disabled={loading || !replyText.trim()}
                                    style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800' }}
                                >
                                    {loading ? 'POSTING...' : 'DISPATCH'}
                                </button>
                                <button
                                    onClick={() => setIsReplying(false)}
                                    style={{ background: 'var(--glass-border)', color: 'var(--foreground)', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800' }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        {replies.map(reply => (
                            <SingleComment
                                key={reply._id}
                                comment={reply}
                                allComments={allComments}
                                onReply={onReply}
                                user={user}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CommentSection({ eventId }: { eventId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/events/${eventId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [eventId]);

    const handlePostComment = async (text: string, parentId: string | null = null) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/events/${eventId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, parentId })
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => [data.comment, ...prev]);
                if (!parentId) setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const rootComments = comments.filter(c => !c.parentId);

    return (
        <div style={{ marginTop: '0rem' }}>
            {user ? (
                <div style={{ marginBottom: '4rem', background: 'var(--glass-bg)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--glass-border)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'var(--secondary)', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>Join the Dialogue</label>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Contribute your thoughts to this movement..."
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: 'var(--background)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '1.25rem',
                            color: 'var(--foreground)',
                            minHeight: '120px',
                            resize: 'none',
                            fontSize: '1.1rem',
                            marginBottom: '1.5rem',
                            outline: 'none',
                            fontWeight: '500'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            disabled={loading || !newComment.trim()}
                            onClick={() => {
                                setLoading(true);
                                handlePostComment(newComment).then(() => setLoading(false));
                            }}
                            style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '1rem 3rem', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                        >
                            {loading ? 'SYNCHRONIZING...' : 'SHARE PERSPECTIVE'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '3rem', background: 'var(--glass-bg)', borderRadius: '2rem', border: '1px solid var(--glass-border)', textAlign: 'center', marginBottom: '4rem' }}>
                    <p style={{ color: 'var(--secondary)', fontWeight: '700' }}>AUTHENTICATION REQUIRED TO JOIN DISCUSSION.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {rootComments.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)', border: '1px dashed var(--glass-border)', borderRadius: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
                        <p style={{ fontWeight: '700' }}>NO ACTIVE DISCOURSES FOUND.</p>
                    </div>
                ) : rootComments.map(comment => (
                    <SingleComment
                        key={comment._id}
                        comment={comment}
                        allComments={comments}
                        onReply={handlePostComment}
                        user={user}
                        depth={0}
                    />
                ))}
            </div>
        </div>
    );
}
