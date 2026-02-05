import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';
import dbConnect from '../lib/mongodb';
import Event from '../models/Event';
import EventCard from '../components/EventCard';
import { useAuth } from '@/context/AuthContext';

export default function Home({ featuredEvents = [] }: { featuredEvents?: any[] }) {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>GuardianLines | Empowering NGOs & Communities</title>
        <meta name="description" content="GuardianLines connects passionate individuals with NGO events, volunteer opportunities, and transparent donation channels." />
      </Head>

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="badge" style={{ marginBottom: '1.5rem', background: 'var(--glass-border)', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600' }}>
            ✨ Connecting NGOs with Changemakers
          </div>
          <h1 className={styles.title}>
            Empowering NGOs to <br />
            <span className="gradient-text">Change the World</span>
          </h1>

          <p className={styles.subtitle}>
            Discover impactful events, connect with dedicated changemakers, and support causes that matter.
            GuardianLines is your all-in-one platform for driving social impact.
          </p>

          <div className={styles.heroButtons}>
            <Link href="/events" className="cta" style={{ background: 'var(--primary)', color: 'var(--primary-invert)', padding: '1.2rem 2.5rem', borderRadius: '50px', fontWeight: '700', fontSize: '1.1rem' }}>
              Explore Events
            </Link>
            {user ? (
              <Link href="/dashboard" className="cta" style={{ background: 'var(--glass-border)', color: 'var(--foreground)', padding: '1.2rem 2.5rem', borderRadius: '50px', fontWeight: '700', fontSize: '1.1rem', border: '1px solid var(--glass-border)' }}>
                View Dashboard
              </Link>
            ) : (
              <Link href="/signup" className="cta" style={{ background: 'var(--glass-border)', color: 'var(--foreground)', padding: '1.2rem 2.5rem', borderRadius: '50px', fontWeight: '700', fontSize: '1.1rem', border: '1px solid var(--glass-border)' }}>
                Join the Movement
              </Link>
            )}
          </div>
        </section>


        {/* Current Events Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Current <span className="gradient-text">Events</span></h2>
              <p className={styles.sectionSubtitle}>Hand-picked opportunities to make a difference right now.</p>
            </div>
            <Link href="/events" className={styles.viewAllLink}>
              View all events <span>&rarr;</span>
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className={styles.eventGrid}>
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '2rem' }}>
              <p style={{ color: '#94a3b8' }}>No current events found. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Why GuardianLines Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '4rem' }}>Why <span className="gradient-text">GuardianLines</span>?</h2>
          <div className={styles.cardGrid}>
            <div className={`${styles.card} glass`}>
              <h3>Verified NGOs</h3>
              <p>Every organization on our platform is thoroughly vetted to ensure transparency and real-world impact.</p>
            </div>

            <div className={`${styles.card} glass`}>
              <h3>Direct Engagement</h3>
              <p>Communicate directly with organizers, join volunteer teams, and track your participation effortlessly.</p>
            </div>

            <div className={`${styles.card} glass`}>
              <h3>Smart Tracking</h3>
              <p>Keep a record of your contributions, volunteer hours, and impact milestones in your personal dashboard.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.section} style={{ textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '3rem', margin: '4rem 1rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{user ? 'Ready to launch something new?' : 'Ready to make your mark?'}</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            {user
              ? 'Start organizing your next community-driven project or find more ways to contribute.'
              : "Whether you're an NGO looking to scale your impact or an individual ready to give back, GuardianLines is here to help."
            }
          </p>
          <div className={styles.heroButtons}>
            <Link href={user ? "/events/create" : "/signup"} className="cta" style={{ background: 'var(--primary)', color: 'var(--primary-invert)', padding: '1rem 2rem', borderRadius: '50px', fontWeight: '700' }}>
              {user ? "Create an Event" : "Get Started Now"}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    await dbConnect();

    // Fetch top 3 upcoming events for the home page
    const result = await Event.find({
      isDisabled: { $ne: true },
      status: { $in: ['Upcoming', 'In Progress'] }
    })
      .populate('category')
      .limit(3)
      .sort({ date: 1 });

    const featuredEvents = JSON.parse(JSON.stringify(result));

    return {
      props: { featuredEvents },
    };
  } catch (error) {
    console.error('Home Page Error:', error);
    return {
      props: { featuredEvents: [] },
    };
  }
}
