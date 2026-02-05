import Navbar from './Navbar';
import styles from './Layout.module.css';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const isAdminPage = router.pathname.startsWith('/admin');

    return (
        <>
            <Head>
                <title>GuardianLines | Empowering NGOs</title>
                <meta name="description" content="Connecting communities with NGO events and programs." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={`${styles.main} ${isAdminPage ? styles.adminMain : ''}`}>
                <div className={styles.background}>
                    <div className={`${styles.blob} ${styles.blob1}`} />
                    <div className={`${styles.blob} ${styles.blob2}`} />
                </div>

                {!isAdminPage && <Navbar />}

                <main className={isAdminPage ? styles.adminContent : styles.content}>
                    {children}
                </main>
            </div>
        </>
    );
}
