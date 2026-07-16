import React, { useState } from 'react';
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
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backBtn: {
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
  subtitle: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '6px' },
  tabs: { display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' },
  tab: (active) => ({
    padding: '8px 22px',
    borderRadius: '100px',
    border: '1px solid ' + (active ? '#6366f1' : '#2d2d44'),
    backgroundColor: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#9ca3af',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  }),
  card: {
    backgroundColor: '#12121e',
    border: '1px solid #1f1f30',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  },
  label: { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#181829',
    border: '1px solid #2d2d44',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#e5e7eb',
    fontSize: '14px',
    marginBottom: '14px',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '13px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  question: { fontSize: '16px', fontWeight: 600, marginBottom: '14px', lineHeight: 1.5 },
  option: (state) => {
    let border = '#2d2d44';
    let bg = '#181829';
    if (state === 'correct') { border = '#22c55e'; bg = 'rgba(34,197,94,0.12)'; }
    else if (state === 'wrong') { border = '#ef4444'; bg = 'rgba(239,68,68,0.12)'; }
    else if (state === 'selected') { border = '#6366f1'; }
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      textAlign: 'left',
      backgroundColor: bg,
      border: '1px solid ' + border,
      borderRadius: '10px',
      padding: '12px 14px',
      marginBottom: '10px',
      color: '#e5e7eb',
      fontSize: '14px',
      cursor: 'pointer',
    };
  },
  optionLetter: { fontWeight: 700, color: '#8b8bff', minWidth: '18px' },
  penjelasan: {
    marginTop: '10px',
    fontSize: '13px',
    color: '#cbd5e1',
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderLeft: '3px solid #6366f1',
    borderRadius: '6px',
    padding: '10px 12px',
    lineHeight: 1.5,
  },
  scoreBox: {
    textAlign: 'center',
    backgroundColor: '#12121e',
    border: '1px solid #1f1f30',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '16px',
  },
  scoreNum: { fontSize: '42px', fontWeight: 800, color: '#6366f1' },
  flashcard: (flipped) => ({
    minHeight: '130px',
    backgroundColor: flipped ? '#1e1b3a' : '#12121e',
    border: '1px solid ' + (flipped ? '#6366f1' : '#1f1f30'),
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  }),
  fcHint: { fontSize: '11px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  fcText: { fontSize: '15px', lineHeight: 1.5 },
  error: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '14px',
    fontSize: '13px',
  },
};

const LETTERS = ['A', 'B', 'C', 'D'];

function Quiz() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('quiz');
  const [materi, setMateri] = useState('');
  const [jumlah, setJumlah] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz state
  const [soal, setSoal] = useState([]);
  const [jawaban, setJawaban] = useState({}); // index soal -> index opsi

  // Flashcard state
  const [kartu, setKartu] = useState([]);
  const [flipped, setFlipped] = useState({});

  const reset = () => {
    setSoal([]);
    setJawaban({});
    setKartu([]);
    setFlipped({});
    setError('');
  };

  const generate = async () => {
    if (!materi.trim()) {
      setError('Isi dulu materi/topiknya ya.');
      return;
    }
    setLoading(true);
    reset();
    try {
      const endpoint = mode === 'quiz' ? '/quiz/generate' : '/quiz/flashcards';
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materi: materi.trim(), jumlah: Number(jumlah) || 5 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal generate. Coba lagi.');
      }
      const data = await res.json();
      if (mode === 'quiz') setSoal(data.soal || []);
      else setKartu(data.kartu || []);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const pilihJawaban = (soalIdx, opsiIdx) => {
    if (jawaban[soalIdx] !== undefined) return; // sudah dijawab, lock
    setJawaban((prev) => ({ ...prev, [soalIdx]: opsiIdx }));
  };

  const toggleFlip = (idx) => {
    setFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const dijawab = Object.keys(jawaban).length;
  const benar = soal.reduce((acc, s, i) => acc + (jawaban[i] === s.jawaban_benar ? 1 : 0), 0);
  const selesai = soal.length > 0 && dijawab === soal.length;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topbar}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>📊 Progress</button>
        </div>

        <h1 style={styles.title}>🎯 Latihan Quiz & Flashcard</h1>
        <p style={styles.subtitle}>AI bikin soal & kartu hafalan dari materi apa pun</p>

        <div style={styles.tabs}>
          <button style={styles.tab(mode === 'quiz')} onClick={() => { setMode('quiz'); reset(); }}>📝 Quiz</button>
          <button style={styles.tab(mode === 'flashcard')} onClick={() => { setMode('flashcard'); reset(); }}>🃏 Flashcard</button>
        </div>

        <div style={styles.card}>
          <label style={styles.label}>Materi / Topik</label>
          <input
            style={styles.input}
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            placeholder="Contoh: Hukum Newton, Teori Relativitas, Fotosintesis"
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
          />
          <label style={styles.label}>Jumlah ({mode === 'quiz' ? 'soal' : 'kartu'})</label>
          <input
            style={styles.input}
            type="number"
            min={1}
            max={15}
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
          />
          <button style={styles.primaryBtn} onClick={generate} disabled={loading}>
            {loading ? '⏳ AI lagi bikin...' : (mode === 'quiz' ? '🚀 Buat Soal' : '🚀 Buat Flashcard')}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* QUIZ RESULT */}
        {mode === 'quiz' && selesai && (
          <div style={styles.scoreBox}>
            <div style={styles.scoreNum}>{benar}/{soal.length}</div>
            <div style={{ color: '#9ca3af', marginTop: '4px' }}>
              {benar === soal.length ? 'Sempurna! 🔥' : benar >= soal.length / 2 ? 'Bagus, terus latihan! 💪' : 'Jangan nyerah, ulang lagi! 📚'}
            </div>
          </div>
        )}

        {mode === 'quiz' && soal.map((s, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.question}>{i + 1}. {s.pertanyaan}</div>
            {s.opsi.map((opsi, j) => {
              let state = null;
              const dijawabIni = jawaban[i] !== undefined;
              if (dijawabIni) {
                if (j === s.jawaban_benar) state = 'correct';
                else if (j === jawaban[i]) state = 'wrong';
              }
              return (
                <button key={j} style={styles.option(state)} onClick={() => pilihJawaban(i, j)}>
                  <span style={styles.optionLetter}>{LETTERS[j]}</span>
                  <span>{opsi}</span>
                  {state === 'correct' && <span style={{ marginLeft: 'auto' }}>✅</span>}
                  {state === 'wrong' && <span style={{ marginLeft: 'auto' }}>❌</span>}
                </button>
              );
            })}
            {jawaban[i] !== undefined && s.penjelasan && (
              <div style={styles.penjelasan}>💡 {s.penjelasan}</div>
            )}
          </div>
        ))}

        {/* FLASHCARDS */}
        {mode === 'flashcard' && kartu.map((k, i) => (
          <div key={i} style={styles.flashcard(flipped[i])} onClick={() => toggleFlip(i)}>
            <div style={styles.fcHint}>{flipped[i] ? 'Jawaban' : 'Kartu ' + (i + 1) + ' · klik untuk balik'}</div>
            <div style={styles.fcText}>{flipped[i] ? k.belakang : k.depan}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Quiz;
