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
  sectionTitle: { fontSize: '15px', fontWeight: 700, margin: '18px 0 12px', display: 'flex', alignItems: 'center', gap: '8px' },
  card: (due) => ({
    backgroundColor: '#12121e',
    border: '1px solid ' + (due ? '#6366f1' : '#1f1f30'),
    borderRadius: '14px',
    padding: '16px 18px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  }),
  materi: { fontSize: '15px', fontWeight: 600, marginBottom: '4px' },
  meta: { fontSize: '12px', color: '#9ca3af' },
  badge: (due) => ({
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '100px',
    backgroundColor: due ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.12)',
    color: due ? '#a5b4fc' : '#9ca3af',
    whiteSpace: 'nowrap',
  }),
  cta: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '28px',
    backgroundColor: '#12121e',
    border: '1px dashed #2d2d44',
    borderRadius: '14px',
  },
  info: { fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 },
  error: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
  },
};

function Review() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL + '/reviews/due');
        if (!res.ok) throw new Error('Gagal ambil jadwal review.');
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

  const labelSisa = (sisa) => {
    if (sisa <= 0) return 'Waktunya review!';
    if (sisa === 1) return 'Besok';
    return sisa + ' hari lagi';
  };

  const renderCard = (item, due) => (
    <div key={item.materi} style={styles.card(due)}>
      <div style={{ minWidth: 0 }}>
        <div style={styles.materi}>{item.materi}</div>
        <div style={styles.meta}>Dipelajari {item.repetisi}x · review tiap {item.interval_hari} hari</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={styles.badge(due)}>{labelSisa(item.sisa_hari)}</span>
        {due && (
          <button style={styles.cta} onClick={() => navigate('/review/topik', { state: { materi: item.materi } })}>📖 Review</button>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topbar}>
          <button style={styles.navBtn} onClick={() => navigate('/')}>← Home</button>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>📊 Progress</button>
        </div>

        <h1 style={styles.title}>🔁 Review Hari Ini</h1>
        <p style={styles.subtitle}>Spaced repetition — review topik di waktu yang pas biar ilmu nempel</p>

        {loading && <div style={styles.empty}>⏳ Ngitung jadwal review...</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && data && (
          <>
            <div style={styles.sectionTitle}>🔥 Perlu Direview ({data.due_count})</div>
            {data.due && data.due.length > 0 ? (
              data.due.map((item) => renderCard(item, true))
            ) : (
              <div style={styles.empty}>Mantap! Nggak ada yang perlu direview sekarang 🎉</div>
            )}

            {data.upcoming && data.upcoming.length > 0 && (
              <>
                <div style={styles.sectionTitle}>📅 Jadwal Berikutnya</div>
                {data.upcoming.map((item) => renderCard(item, false))}
              </>
            )}

            {data.total_topik === 0 && (
              <div style={styles.empty}>Belum ada topik. Mulai belajar dulu, nanti jadwal review muncul otomatis.</div>
            )}

            <div style={styles.info}>
              💡 Jadwal dihitung otomatis dari sesi belajarmu. Makin sering suatu topik dipelajari, jeda review-nya makin panjang (1 → 3 → 7 → 14 → 30 hari).
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Review;
