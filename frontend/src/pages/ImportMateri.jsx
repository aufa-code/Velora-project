import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const MAX_MB = 4;

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
  wrapper: { width: '100%', maxWidth: '640px' },
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
  card: {
    backgroundColor: '#12121e',
    border: '1px solid #1f1f30',
    borderRadius: '16px',
    padding: '24px',
  },
  dropzone: {
    display: 'block',
    border: '2px dashed #2d2d44',
    borderRadius: '14px',
    padding: '32px 16px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  fileName: { fontSize: '14px', color: '#a5b4fc', marginTop: '10px', fontWeight: 600 },
  hint: { fontSize: '12px', color: '#6b7280', marginTop: '6px' },
  btnPrimary: {
    width: '100%',
    marginTop: '16px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnDisabled: { backgroundColor: '#2d2d44', color: '#6b7280', cursor: 'not-allowed' },
  error: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    marginTop: '16px',
  },
  resultCard: {
    backgroundColor: '#12121e',
    border: '1px solid #6366f1',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '20px',
  },
  resultTopik: { fontSize: '20px', fontWeight: 700, color: '#e5e7eb' },
  meta: { fontSize: '12px', color: '#9ca3af', marginTop: '4px', marginBottom: '16px' },
  bullet: { display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '14px', lineHeight: 1.6 },
  dot: { color: '#8b8bff', flexShrink: 0 },
  para: { fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' },
  ctaRow: { display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' },
  ctaQuiz: {
    flex: 1,
    minWidth: '160px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  ctaGhost: {
    flex: 1,
    minWidth: '160px',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #2d2d44',
    backgroundColor: 'transparent',
    color: '#8b8bff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

function ImportMateri() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const pickFile = (f) => {
    setError('');
    setResult(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('File harus berformat PDF.');
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError('PDF kegedean (maks ~' + MAX_MB + 'MB). Coba file yang lebih kecil.');
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(API_URL + '/import/pdf', { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal memproses PDF.');
      }
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const renderRingkasan = (text) => {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.map((line, i) => {
      const isBullet = line.startsWith('- ') || line.startsWith('•') || line.startsWith('* ');
      if (isBullet) {
        const clean = line.replace(/^[-*•]\s*/, '');
        return (
          <div key={i} style={styles.bullet}>
            <span style={styles.dot}>▸</span>
            <span>{clean}</span>
          </div>
        );
      }
      return (
        <div key={i} style={styles.para}>
          {line}
        </div>
      );
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topbar}>
          <button style={styles.navBtn} onClick={() => navigate('/')}>← Home</button>
          <button style={styles.navBtn} onClick={() => navigate('/quiz')}>🎯 Quiz</button>
        </div>

        <h1 style={styles.title}>📄 Import Materi (PDF)</h1>
        <p style={styles.subtitle}>
          Upload PDF materi/catatan → Velora ekstrak & rangkum otomatis, langsung bisa dibikin kuis
        </p>

        <div style={styles.card}>
          <label htmlFor="pdf-input" style={styles.dropzone}>
            <div style={{ fontSize: '34px' }}>📎</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Klik untuk pilih file PDF</div>
            <div style={styles.hint}>Maksimal ~{MAX_MB}MB · PDF berisi teks (bukan hasil scan)</div>
            {file && <div style={styles.fileName}>📄 {file.name}</div>}
          </label>
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => pickFile(e.target.files && e.target.files[0])}
          />

          <button
            style={{ ...styles.btnPrimary, ...(!file || loading ? styles.btnDisabled : {}) }}
            onClick={upload}
            disabled={!file || loading}
          >
            {loading ? '⏳ Memproses PDF...' : '🚀 Proses & Rangkum'}
          </button>

          {error && <div style={styles.error}>{error}</div>}
        </div>

        {result && (
          <div style={styles.resultCard}>
            <div style={styles.resultTopik}>{result.topik}</div>
            <div style={styles.meta}>
              📄 {result.nama_file} · {result.jumlah_halaman} halaman
              {result.terpotong ? ' · (dirangkum dari bagian awal)' : ''}
            </div>
            {result.ringkasan ? (
              renderRingkasan(result.ringkasan)
            ) : (
              <div style={styles.para}>Ringkasan tidak tersedia.</div>
            )}

            <div style={styles.ctaRow}>
              <button
                style={styles.ctaQuiz}
                onClick={() => navigate('/quiz', { state: { materi: result.topik } })}
              >
                🎯 Buat Kuis dari Materi Ini
              </button>
              <button
                style={styles.ctaGhost}
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
              >
                🔄 Import Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportMateri;
