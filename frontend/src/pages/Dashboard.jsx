import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Label ramah untuk kode tujuan yang tersimpan di database
const TUJUAN_LABEL = {
  'ujian': 'Persiapan Ujian',
  'ngerti dalam': 'Pemahaman Mendalam',
  'jelasin ke orang lain': 'Feynman Technique',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchProgress = () => {
    setLoading(true);
    setError('');
    axios
      .get(`${process.env.REACT_APP_API_URL}/progress`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError('Gagal memuat data progress. Periksa koneksi lalu coba lagi.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const formatTanggal = (iso) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return iso;
    }
  };

  const sessions = (data && data.sessions) || [];
  const materiUnik = new Set(
    sessions.map((s) => (s.materi || '').trim().toLowerCase()).filter(Boolean)
  ).size;

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      color: '#f1f1f6',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '40px 20px',
    },
    inner: { width: '100%', maxWidth: '900px', margin: '0 auto' },
    topbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '32px',
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: '-0.5px',
      marginBottom: '6px',
    },
    subtitle: { fontSize: '14px', color: '#8e8ea8' },
    btnPrimary: {
      padding: '12px 20px',
      backgroundColor: '#6366f1',
      color: '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      marginBottom: '36px',
    },
    statCard: {
      backgroundColor: '#12121e',
      border: '1px solid #1f1f38',
      borderRadius: '14px',
      padding: '20px',
    },
    statNumber: { fontSize: '30px', fontWeight: '700', color: '#ffffff' },
    statLabel: { fontSize: '13px', color: '#8e8ea8', marginTop: '4px' },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#c5c5d2',
      marginBottom: '16px',
    },
    sessionCard: {
      backgroundColor: '#12121e',
      border: '1px solid #1f1f38',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '14px',
    },
    sessionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px',
    },
    materi: { fontSize: '17px', fontWeight: '700', color: '#ffffff' },
    tanggal: { fontSize: '12px', color: '#8e8ea8', whiteSpace: 'nowrap' },
    badgeRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
    badge: {
      fontSize: '12px',
      fontWeight: '600',
      padding: '5px 10px',
      borderRadius: '999px',
      backgroundColor: '#1e1b4b',
      color: '#c7d2fe',
      border: '1px solid #312e81',
    },
    badgeUniverse: {
      fontSize: '12px',
      fontWeight: '600',
      padding: '5px 10px',
      borderRadius: '999px',
      backgroundColor: '#0f2e24',
      color: '#86efac',
      border: '1px solid #14532d',
    },
    metrics: { display: 'flex', gap: '24px', borderTop: '1px solid #1f1f38', paddingTop: '12px' },
    metric: { fontSize: '13px', color: '#8e8ea8' },
    metricNum: { color: '#ffffff', fontWeight: '700' },
    center: { textAlign: 'center', padding: '60px 0', color: '#8e8ea8' },
    errorBox: {
      color: '#f87171',
      fontSize: '14px',
      backgroundColor: 'rgba(248, 113, 113, 0.1)',
      padding: '14px 16px',
      borderRadius: '10px',
      border: '1px solid rgba(248, 113, 113, 0.2)',
      marginBottom: '20px',
    },
    retryBtn: {
      marginLeft: '12px',
      padding: '6px 12px',
      backgroundColor: '#2d2d44',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>📊 Dashboard Progress</div>
            <div style={styles.subtitle}>Rekap perjalanan belajarmu bersama Velora AI</div>
          </div>
          <button style={styles.btnPrimary} onClick={() => navigate('/')}>
            + Sesi Baru
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
            <button style={styles.retryBtn} onClick={fetchProgress}>Coba lagi</button>
          </div>
        )}

        {loading && <div style={styles.center}>Memuat data progress...</div>}

        {!loading && !error && data && (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{data.total_sesi || 0}</div>
                <div style={styles.statLabel}>Total Sesi Belajar</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{data.total_pesan || 0}</div>
                <div style={styles.statLabel}>Total Interaksi Chat</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{materiUnik}</div>
                <div style={styles.statLabel}>Materi Dipelajari</div>
              </div>
            </div>

            <div style={styles.sectionTitle}>Riwayat Sesi</div>

            {sessions.length === 0 && (
              <div style={styles.center}>
                Belum ada sesi belajar. Yuk mulai sesi pertamamu!
              </div>
            )}

            {sessions.map((s) => (
              <div key={s.id} style={styles.sessionCard}>
                <div style={styles.sessionHeader}>
                  <div style={styles.materi}>{s.materi || 'Tanpa Judul'}</div>
                  <div style={styles.tanggal}>{formatTanggal(s.created_at)}</div>
                </div>
                <div style={styles.badgeRow}>
                  <span style={styles.badge}>{TUJUAN_LABEL[s.tujuan] || s.tujuan || '-'}</span>
                  {s.metode && <span style={styles.badge}>{s.metode}</span>}
                  {s.universe && <span style={styles.badgeUniverse}>🎭 {s.universe}</span>}
                </div>
                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <span style={styles.metricNum}>{s.jumlah_pesan ?? 0}</span> pesan
                  </div>
                  <div style={styles.metric}>
                    <span style={styles.metricNum}>{s.jumlah_tanya ?? 0}</span> pertanyaan
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
