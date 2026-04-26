'use client';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const features = [
  { icon: '📄', title: 'Smart Ingestion', desc: 'Paste or upload your JD and resume. AI extracts every required skill and maps it to your profile.' },
  { icon: '🤖', title: 'Conversational Assessment', desc: 'The AI agent asks scenario-based questions — not trivia. It probes your real depth on each skill.' },
  { icon: '🎯', title: 'Gap Analysis', desc: 'See exactly where you stand. Visual heatmap shows critical gaps vs. strengths.' },
  { icon: '🗺️', title: 'Personalised Roadmap', desc: 'Curated resources, time estimates, and adjacent skills — a week-by-week learning plan built for you.' },
];

const stats = [
  { value: '10+', label: 'Skills Assessed' },
  { value: '2 min', label: 'To Get Results' },
  { value: '100%', label: 'AI-Powered' },
];

export default function Home() {
  const router = useRouter();
  return (
    <main className={styles.main}>
      {/* Background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className="grad-text" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Catalyst</span>
        </div>
        <div className={styles.navLinks}>
          <span className="badge badge-purple">AI-Powered</span>
          <span className="badge badge-green">OpenRouter</span>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroTag}>
          <span className={styles.heroDot} />
          AI Skill Assessment Agent
        </div>
        <h1 className={styles.heroTitle}>
          Know What You Know.{' '}
          <span className="grad-text">Learn What Matters.</span>
        </h1>
        <p className={styles.heroSub}>
          A resume tells you what someone claims to know — not how well they actually know it.
          Our AI agent assesses real proficiency, identifies gaps, and builds your personalised learning roadmap.
        </p>
        <div className={styles.heroCtas}>
          <button id="start-btn" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }} onClick={() => router.push('/assess')}>
            Start Assessment →
          </button>
          <button className="btn btn-ghost" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
            See How It Works
          </button>
        </div>
        {/* Stats */}
        <div className={styles.stats}>
          {stats.map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue + ' grad-text'}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Four Phases. One Complete Picture.</h2>
          <p>From raw documents to a personalised learning plan in minutes.</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={f.title} className={styles.featureCard + ' glass'} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner + ' glass'}>
          <h2>Ready to find your skill gaps?</h2>
          <p>Paste your job description and resume. The AI does the rest.</p>
          <button className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 28px' }} onClick={() => router.push('/assess')}>
            Start Free Assessment →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className="grad-text" style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>⚡ Catalyst</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Powered by Gemini 2.0 Flash</span>
      </footer>
    </main>
  );
}
