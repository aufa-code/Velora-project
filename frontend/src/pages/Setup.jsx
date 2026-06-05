import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Setup() {
    const navigate = useNavigate();

    // State untuk kontrol alur bertahap (step-by-step)
    const [step, setStep] = useState(1);
    const [loadingMethods, setLoadingMethods] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // State penampung data formulir
    const [materi, setMateri] = useState('');
    const [tujuan, setTujuan] = useState('');
    const [methods, setMethods] = useState([]);
    const [metode, setMetode] = useState('');
    const [pakaiUniverse, setPakaiUniverse] = useState(null); // null, true, false
    const [universe, setUniverse] = useState('');

    // Static options untuk tujuan belajar
    const opsiTujuan = [
        { id: 'ujian', title: 'Persiapan Ujian', desc: 'Fokus pada kisi-kisi, latihan soal, dan ringkasan taktis.' },
        { id: 'ngerti dalam', title: 'Pemahaman Mendalam', desc: 'Eksplorasi konsep akar, analogi intuitif, dan studi kasus.' },
        { id: 'jelasin ke orang lain', title: 'Feynman Technique', desc: 'Belajar mendobrak materi agar siap diajarkan kembali ke orang lain.' }
    ];

    // Mengambil data metode belajar secara asinkronus setelah tujuan dipilih
    useEffect(() => {
        if (tujuan) {
            setLoadingMethods(true);
            setError('');
            axios.get(`${process.env.REACT_APP_API_URL}/setup/methods`)
                .then((res) => {
                    setMethods(res.data);
                    setStep(3); // Melangkah ke pemilihan metode belajar setelah data siap
                })
                .catch((err) => {
                    console.error(err);
                    setError('Gagal mengambil metode belajar. Silakan coba lagi.');
                })
                .finally(() => {
                    setLoadingMethods(false);
                });
        }
    }, [tujuan]);

    // Mengirimkan data konfigurasi akhir untuk memulai sesi
    const handleStartLearning = () => {
        if (pakaiUniverse && !universe.trim()) {
            setError('Silakan isi nama karakter atau universe favoritmu.');
            return;
        }

        setSubmitting(true);
        setError('');

        const payload = {
            materi,
            tujuan,
            metode,
            universe: pakaiUniverse ? universe : ''
        };

        axios.post(`${process.env.REACT_APP_API_URL}/setup/start`, payload)
            .then((res) => {
                if (res.data && res.data.session_id) {
                    localStorage.setItem('velora_materi', materi);
                    navigate('/session', { state: { sessionId: res.data.session_id, materi: materi } });
                } else {
                    setError('Sesi gagal dibuat. Format respon data tidak sesuai.');
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Gagal memulai sesi belajar. Silakan periksa koneksi atau coba lagi.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    // Desain kustom bertema misterius dan modern
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0f',
            color: '#f1f1f6',
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        },
        cardWrapper: {
            width: '100%',
            maxWidth: '640px',
            backgroundColor: '#12121e',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '1px solid #1f1f38'
        },
        header: {
            textAlign: 'center',
            marginBottom: '32px'
        },
        title: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            marginBottom: '8px'
        },
        subtitle: {
            fontSize: '14px',
            color: '#8e8ea8'
        },
        section: {
            marginBottom: '28px',
            animation: 'fadeIn 0.4s ease-in-out'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#c5c5d2'
        },
        input: {
            width: '100%',
            padding: '14px 16px',
            backgroundColor: '#181829',
            border: '1px solid #2d2d44',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
        },
        grid: {
            display: 'block'
        },
        cardOption: (isSelected) => ({
            padding: '16px',
            backgroundColor: isSelected ? '#1e1b4b' : '#181829',
            border: isSelected ? '2px solid #6366f1' : '1px solid #2d2d44',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'all 0.2s ease',
            textAlign: 'left'
        }),
        optionTitle: {
            fontSize: '15px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '4px'
        },
        optionDesc: {
            fontSize: '13px',
            color: '#8e8ea8',
            lineHeight: '1.4'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '8px'
        },
        btnToggle: (isActive) => ({
            flex: 1,
            padding: '12px',
            backgroundColor: isActive ? '#6366f1' : '#181829',
            border: isActive ? '1px solid #6366f1' : '1px solid #2d2d44',
            borderRadius: '10px',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }),
        btnPrimary: {
            width: '100%',
            padding: '14px',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.2s',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        },
        btnNext: {
            padding: '10px 20px',
            backgroundColor: '#2d2d44',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '12px',
            float: 'right'
        },
        errorMsg: {
            color: '#f87171',
            fontSize: '13px',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid rgba(248, 113, 113, 0.2)'
        },
        loadingText: {
            fontSize: '14px',
            color: '#8e8ea8',
            textAlign: 'center',
            padding: '20px 0'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.cardWrapper}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Inisialisasi Velora AI</h1>
                    <p style={styles.subtitle}>Rancang personalisasi ruang belajar cerdas Anda</p>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}

                {/* STEP 1: Input Materi Belajar */}
                {step >= 1 && (
                    <div style={styles.section}>
                        <label style={styles.label}>1. Apa materi atau topik yang ingin kamu kuasai?</label>
                        <input
                            type="text"
                            placeholder="Contoh: Algoritma Dijkstra, Teori Relativitas, Hukum Termodinamika"
                            value={materi}
                            onChange={(e) => setMateri(e.target.value)}
                            style={styles.input}
                            disabled={step > 1}
                        />
                        {step === 1 && materi.trim().length > 2 && (
                            <button 
                                style={styles.btnNext} 
                                onClick={() => setStep(2)}
                            >
                                Lanjut
                            </button>
                        )}
                    </div>
                )}

                {/* STEP 2: Pilih Tujuan Belajar */}
                {step >= 2 && (
                    <div style={styles.section}>
                        <label style={styles.label}>2. Apa target pencapaian dari materi ini?</label>
                        <div style={styles.grid}>
                            {opsiTujuan.map((opsi) => (
                                <div
                                    key={opsi.id}
                                    style={styles.cardOption(tujuan === opsi.id)}
                                    onClick={() => step === 2 && setTujuan(opsi.id)}
                                >
                                    <div style={styles.optionTitle}>{opsi.title}</div>
                                    <div style={styles.optionDesc}>{opsi.desc}</div>
                                </div>
                            ))}
                        </div>
                        {loadingMethods && <div style={styles.loadingText}>Menganalisis metode belajar optimal...</div>}
                    </div>
                )}

                {/* STEP 3: Pilih Metode Belajar (dari API) */}
                {step >= 3 && (
                    <div style={styles.section}>
                        <label style={styles.label}>3. Pilih metode pembelajaran bimbingan AI:</label>
                        <div style={styles.grid}>
                            {methods.map((m) => (
                                <div
                                    key={m.name} // Menggunakan m.name sebagai key unik karena id tidak tersedia
                                    style={styles.cardOption(metode === m.name)}
                                    onClick={() => { if (step === 3) { setMetode(m.name); setStep(4); } }}
                                >
                                    <div style={styles.optionTitle}>{m.name}</div>
                                    <div style={styles.optionDesc}>{m.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: Pertanyaan Karakter / Universe */}
                {step >= 4 && (
                    <div style={styles.section}>
                        <label style={styles.label}>4. Mau belajar pakai karakter atau universe favorit?</label>
                        <div style={styles.buttonGroup}>
                            <button
                                style={styles.btnToggle(pakaiUniverse === true)}
                                onClick={() => setPakaiUniverse(true)}
                            >
                                Ya, tentu
                            </button>
                            <button
                                style={styles.btnToggle(pakaiUniverse === false)}
                                onClick={() => [setPakaiUniverse(false), setUniverse('')]}
                            >
                                Tidak perlu
                            </button>
                        </div>

                        {pakaiUniverse === true && (
                            <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease' }}>
                                <label style={styles.label}>Masukkan Nama Karakter / Universe:</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Iron Man, Hogwarts, Batman, Cyberpunk 2077"
                                    value={universe}
                                    onChange={(e) => setUniverse(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        )}

                        {/* Tombol Aksi Akhir */}
                        {(pakaiUniverse === false || (pakaiUniverse === true && universe.trim().length > 0)) && (
                            <button
                                style={styles.btnPrimary}
                                onClick={handleStartLearning}
                                disabled={submitting}
                            >
                                {submitting ? 'Mempersiapkan Ruang Belajar...' : 'Mulai Belajar'}
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}