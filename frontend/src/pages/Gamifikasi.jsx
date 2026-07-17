import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#e5e7eb',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  wrapper: { width: '100%', maxWidth: '720px' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  navBtn: {
    background: 'transparent',
    color: '#8b8bff',
    border: '1px solid #2d2d44',
    borderRadius: '100px',
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  title: { fontSize: '26px', fontWeight: 700, margin: 0, textAlign: 'center' },
  subtitle: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '6px', marginBottom: '24px' },
  levelCard: {
    background: 'linear-gradient(135deg, #1e1b3a, #12121e)',
    border: '1px solid #2d2d44',
    borderRadius: '18px',
    padding: '24px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  levelNum: { fontSize: '44px', fontWeight: 800, color: '#8b8bff', lineHeight: 1 },
  levelLabel: { fontSize: '13px', color: '#9ca3af', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
  barOuter: {
    marginTop: '18px',
    height: '12px',
    backgroundColor: '#181829',
    borderRadius: '100px',
    overflow: 'hidden',
    border: '1px solid #2d2d44',
  },
  barInner: (p) => ({
    height: '100%',
    width: p + '%',
    background: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
    borderRadius: '100px',
    transition: 'width 0.6s ease',
  }),
  xpText: { fontSize: '12px', color: '#9ca3af', marginTop: '8px' },
  statRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  statCard: {
    flex: 1,
    backgroundColor: '#12121e',
    border: '1px solid #1f1f30',
    borderRadius: '14px',
    padding: '16px',
    textAlign: 'center',
  },
  statNum: { fontSize: '24px', fontWeight: 800, color: '#e5e7eb' },
  statLabel: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  streakCard: {
    backgroundColor: '#12121e',
    border: '1px solid #f59e0b',
    borderRadius: '14px',
    padding: '18px 20px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  streakNum: { fontSize: '30px', fontWeight: 800, color: '#f59e0b' },
  sectionTitle: { fontSize: '15px', fontWeight: 700, margin: '8px 0 14px' },
  badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' },
  badge: (unlocked) => ({
    backgroundColor: unlocked ? 'rgba(99,102,241,0.1)' : '#101018',
    border: '1px solid ' + (unlocked ? '#6366f1' : '#1f1f30'),
    borderRadius: '14px',
    padding: '16px',
    textAlign: 'center',
    opacity: unlocked ? 1 : 0.5,
  }),
  badgeIcon: (unlocked) => ({ fontSize: '30px', filter: unlocked ? 'none' : 'grayscale(1)' }),
  badgeName: { fontSize: '13px', fontWeight: 700, marginTop: '6px' },
  badgeDesc: { fontSize: '11px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.4 },
  loading: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '40px',
    backgroundColor: '#12121e',
    border: '1px solid #1f1f30',
    borderRadius: '16px',
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
  },
};

function Gamifikasi() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL + '/stats/gamifikasi');
        if (!res.ok) throw new Error('Gagal ambil data pencapaian.');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message || 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topbar}>
          <button style={styles.navBtn} onClick={() => navigate('/')}>← Home</button>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>📊 Progress</button>
        </div>

        <h1 style={styles.title}>🎮 Pencapaian</h1>
        <p style={styles.subtitle}>Kumpulin XP, jaga streak, dan buka badge dari aktivitas belajarmu</p>

        {loading && <div style={styles.loading}>⏳ Ngitung pencapaianmu...</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && data && (
          <>
            <div style={styles.levelCard}>
              <div style={styles.levelNum}>Lv {data.level}</div>
              <div style={styles.levelLabel}>{data.xp} XP Total</div>
              <div style={styles.barOuter}>
                <div style={styles.barInner(data.progress_persen)} />
              </div>
              <div style={styles.xpText}>
                {data.xp_di_level} / {data.xp_butuh_level} XP menuju Level {data.level + 1}
              </div>
            </div>

            <div style={styles.streakCard}>
              <span style={{ fontSize: '30px' }}>🔥</span>
              <div>
                <span style={styles.streakNum}>{data.streak}</span>
                <span style={{ fontSize: '15px', color: '#9ca3af', marginLeft: '6px' }}>
                  hari streak
                </span>
              </div>
            </div>

            <div style={styles.statRow}>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{data.total_sesi}</div>
                <div style={styles.statLabel}>Sesi Belajar</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{data.total_topik}</div>
                <div style={styles.statLabel}>Topik</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{data.total_pesan}</div>
                <div style={styles.statLabel}>Pesan</div>
              </div>
            </div>

            <div style={styles.sectionTitle}>
              🏅 Badge ({data.badge_terbuka}/{data.badges.length})
            </div>
            <div style={styles.badgeGrid}>
              {data.badges.map((b) => (
                <div key={b.nama} style={styles.badge(b.unlocked)}>
                  <div style={styles.badgeIcon(b.unlocked)}>{b.unlocked ? b.icon : '🔒'}</div>
                  <div style={styles.badgeName}>{b.nama}</div>
                  <div style={styles.badgeDesc}>{b.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Gamifikasi;
