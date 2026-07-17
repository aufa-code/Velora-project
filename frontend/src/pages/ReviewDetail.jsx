import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  title: { fontSize: '24px', fontWeight: 700, margin: 0, textAlign: 'center' },
  subtitle: { color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginTop: '6px', marginBottom: '24px' },
  card: {
    backgroundColor: '#12121e',
    border: '1px solid #1f1f30',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  sectionLabel: { fontSize: '13px', color: '#8b8bff', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  bullet: { display: 'flex', gap: '10px', marginBottom: '12px', lineHeight: 1.55, fontSize: '14.5px' },
  dot: { color: '#6366f1', fontWeight: 700, flexShrink: 0 },
  para: { marginBottom: '12px', lineHeight: 1.6, fontSize: '14.5px' },
  ctaBtn: {
    width: '100%',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '15px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  hint: { fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '12px', lineHeight: 1.6 },
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

function ReviewDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const materi = (location.state && location.state.materi) || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ringkasan, setRingkasan] = useState('');

  useEffect(() => {
    if (!materi) {
      navigate('/review');
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(API_URL + '/reviews/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ materi }),
        });
        if (!res.ok) throw new Error('Gagal ambil rangkuman. Coba lagi.');
        const data = await res.json();
        setRingkasan(data.ringkasan || '');
      } catch (e) {
        setError(e.message || 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRingkasan = () => {
    const lines = ringkasan.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.map((line, i) => {
      const isBullet = line.startsWith('- ') || line.startsWith('•') || line.startsWith('* ');
      if (isBullet) {
        const text = line.replace(/^[-*•]\s*/, '');
        return (
          <div key={i} style={styles.bullet}>
            <span style={styles.dot}>▸</span>
            <span>{text}</span>
          </div>
        );
      }
      return <div key={i} style={styles.para}>{line}</div>;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topbar}>
          <button style={styles.navBtn} onClick={() => navigate('/review')}>← Review</button>
          <button style={styles.navBtn} onClick={() => navigate('/')}>🏠 Home</button>
        </div>

        <h1 style={styles.title}>📖 Review: {materi}</h1>
        <p style={styles.subtitle}>Inget-inget lagi yang udah dipelajari, terus uji dirimu</p>

        {loading && <div style={styles.loading}>⏳ AI lagi ngerangkum materimu...</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            <div style={styles.card}>
              <div style={styles.sectionLabel}>📝 Rangkuman Materi</div>
              {renderRingkasan()}
            </div>

            <button
              style={styles.ctaBtn}
              onClick={() => navigate('/quiz', { state: { materi } })}
            >
              🎯 Uji Diri dengan Kuis
            </button>
            <div style={styles.hint}>
              Cara paling ampuh biar nempel: langsung tes pemahamanmu setelah baca rangkuman 💡
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReviewDetail;
