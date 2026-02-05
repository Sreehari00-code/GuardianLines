import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './AuthGuard.module.css';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            const path = router.pathname;
            const isPublic = PUBLIC_ROUTES.includes(path);

            if (!user && !isPublic) {
                setShowModal(true);
                setIsAuthorized(false);
            } else {
                setShowModal(false);
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router.pathname]);

    const handleNavigate = (path: string) => {
        setShowModal(false);
        router.push(path);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--background)',
                color: 'white'
            }}>
                Loading...
            </div>
        );
    }

    if (showModal) {
        return (
            <div className={styles.overlay}>
                <div className={`${styles.modal} glass`}>
                    <h2 className={styles.title}>Login Required</h2>
                    <p className={styles.message}>
                        You need to be logged in to access this page. Please sign in or create an account to continue.
                    </p>
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.loginBtn}
                            onClick={() => handleNavigate('/login')}
                        >
                            Sign In
                        </button>
                        <button
                            className={styles.signupBtn}
                            onClick={() => handleNavigate('/signup')}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isPublic = PUBLIC_ROUTES.includes(router.pathname);
    if (!user && !isPublic) {
        return null;
    }

    return <>{children}</>;
};

export default AuthGuard;
