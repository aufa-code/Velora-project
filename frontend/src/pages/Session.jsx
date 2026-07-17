import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Session = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil sessionId dari react-router state (useLocation)
  const sessionId = location.state?.sessionId;

  // State untuk menyimpan alur chat bubble
  const sessionData = location.state;
  const materiLabel =
    sessionData?.materi || localStorage.getItem('velora_materi') || 'materi yang kamu pilih';
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Oke, kita mulai belajar tentang "${materiLabel}". Mau mulai dari mana?`,
    },
  ]);

  // State untuk input pesan dan loading indicator
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Voice Mode
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const voiceOnRef = useRef(false);

  // Ref untuk mekanisme auto scroll
  const chatEndRef = useRef(null);

  // Sinkronkan voiceOn ke ref biar tidak kena stale closure
  useEffect(() => {
    voiceOnRef.current = voiceOn;
    if (!voiceOn && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [voiceOn]);

  // Proteksi halaman jika user mencoba akses langsung tanpa sessionId dari Setup
  useEffect(() => {
    if (!sessionId) {
      console.error('Session ID tidak ditemukan. Kembali ke halaman setup.');
      navigate('/');
    }
  }, [sessionId, navigate]);

  // Auto scroll ke bawah setiap ada pesan baru atau ketika loading state berubah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Bersihkan suara saat keluar halaman
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  // Text-to-Speech: bacakan teks pakai suara Bahasa Indonesia
  const speak = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID';
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  // Fungsi handle kirim pesan (POST ke endpoint /session/chat)
  const handleSendMessage = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : inputText).trim();
    if (!text || isLoading) return;

    const userMessage = text;
    setInputText(''); // Clear input teks segera setelah dikirim

    // Render bubble chat user di sebelah kanan secara instan
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true); // Tampilkan loading indicator

    try {
      // POST ke /session/chat membawa data {session_id, message}
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/session/chat`, {
        session_id: sessionId,
        message: userMessage,
      });

      // Menyesuaikan format data dari backend
      const aiResponse =
        response.data?.response ||
        response.data?.message ||
        'Maaf, Velora tidak memberikan respon valid.';

      // Tampilkan response AI di bubble chat kiri
      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);

      // Kalau Voice Mode aktif, bacakan jawaban Velora
      if (voiceOnRef.current) speak(aiResponse);
    } catch (error) {
      console.error('Error saat mengirim pesan:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Gagal tersambung dengan server Velora. Silakan coba lagi nanti.' },
      ]);
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  // Mulai mendengarkan suara (Speech-to-Text)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Browser kamu belum mendukung input suara. Coba pakai Chrome terbaru ya.');
      return;
    }
    setVoiceError('');
    const rec = new SpeechRecognition();
    rec.lang = 'id-ID';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleSendMessage(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // Handler KeyDown untuk menangkap aksi tekan tombol Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.statusDot}></div>
          <h1 style={styles.headerTitle}>Velora Active Session</h1>
        </div>
        <div style={styles.headerRight}>
          <button
            onClick={() => setVoiceOn((v) => !v)}
            style={{ ...styles.voiceToggle, ...(voiceOn ? styles.voiceToggleOn : {}) }}
            title="Bacakan jawaban Velora dengan suara"
          >
            {voiceOn ? '🔊 Suara: ON' : '🔇 Suara: OFF'}
          </button>
          <span style={styles.sessionIdBadge}>ID: {sessionId || 'N/A'}</span>
        </div>
      </div>

      {/* Area Tampilan Chat Bubble */}
      <div style={styles.chatArea}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble),
              }}
            >
              {msg.text}
              {msg.sender === 'ai' && (
                <button
                  onClick={() => speak(msg.text)}
                  style={styles.speakBtn}
                  title="Dengarkan"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator saat menunggu respons AI */}
        {isLoading && (
          <div style={styles.messageRow}>
            <div style={{ ...styles.bubble, ...styles.aiBubble, ...styles.loadingBubble }}>
              <span style={styles.dot}>.</span>
              <span style={styles.dot}>.</span>
              <span style={styles.dot}>.</span>
              <span style={styles.loadingText}>Velora sedang merangkum materi...</span>
            </div>
          </div>
        )}

        {/* Anchor element untuk target Auto Scroll */}
        <div ref={chatEndRef} />
      </div>

      {/* Input Teks di Bawah + Tombol Mic + Kirim */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <button
            onClick={listening ? stopListening : startListening}
            disabled={isLoading}
            style={{ ...styles.micButton, ...(listening ? styles.micActive : {}) }}
            title={listening ? 'Berhenti merekam' : 'Bicara'}
          >
            {listening ? '⏹️' : '🎤'}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={listening ? 'Mendengarkan...' : 'Ketik atau tekan mic buat ngomong...'}
            style={styles.input}
          />
          <button onClick={() => handleSendMessage()} disabled={isLoading} style={styles.sendButton}>
            Kirim
          </button>
        </div>
        {voiceError && <div style={styles.voiceError}>{voiceError}</div>}
      </div>
    </div>
  );
};

// Objek Gaya Inline CSS dengan Dark Theme Konsisten
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0a0a0f',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#11111a',
    borderBottom: '1px solid #1e1e2f',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '0.5px',
  },
  voiceToggle: {
    backgroundColor: '#1e1e2f',
    color: '#94a3b8',
    border: '1px solid #232336',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  voiceToggleOn: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: '1px solid #6366f1',
  },
  sessionIdBadge: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#1e1e2f',
    padding: '4px 10px',
    borderRadius: '6px',
    fontFamily: 'monospace',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  userBubble: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
  },
  aiBubble: {
    backgroundColor: '#161622',
    color: '#e2e8f0',
    borderBottomLeftRadius: '4px',
    border: '1px solid #232336',
  },
  speakBtn: {
    marginLeft: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    opacity: 0.6,
    padding: 0,
  },
  loadingBubble: {
    display: 'flex',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: '8px',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  dot: {
    fontSize: '1.5rem',
    lineHeight: '1',
    color: '#6366f1',
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: '16px 24px',
    backgroundColor: '#11111a',
    borderTop: '1px solid #1e1e2f',
  },
  inputWrapper: {
    display: 'flex',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#0a0a0f',
    border: '1px solid #232336',
    borderRadius: '12px',
    padding: '4px',
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: 'transparent',
    color: '#f8fafc',
    border: 'none',
    fontSize: '1.2rem',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  micActive: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f8fafc',
    padding: '12px 16px',
    fontSize: '0.95rem',
    outline: 'none',
  },
  sendButton: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  voiceError: {
    color: '#fca5a5',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '8px',
  },
};

export default Session;
