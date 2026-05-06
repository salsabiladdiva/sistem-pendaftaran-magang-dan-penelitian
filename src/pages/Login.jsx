import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State baru untuk menggantikan window.alert()
  const [pesanError, setPesanError] = useState('');
  const [pesanSukses, setPesanSukses] = useState('');
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPesanError(''); // Reset pesan sebelumnya
    setPesanSukses('');

    try {
      if (isRegister) {
        // 1. Proses Sign Up di Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // 2. Jika berhasil, masukkan Nama Lengkap ke tabel profiles
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            { id: data.user.id, nama_lengkap: namaLengkap, role: 'Mahasiswa' }
          ]);
          if (profileError) throw profileError;
        }

        // Tampilkan pesan sukses cantik
        setPesanSukses('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
        setIsRegister(false); 
        setPassword(''); 
      } else {
        // Proses Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error('Email atau password salah!'); // Custom error message
        navigate('/');
      }
    } catch (error) {
      // Tampilkan pesan error di form, bukan di popup browser
      setPesanError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f4f7f6',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        padding: '40px', 
        background: 'white', 
        borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '350px' 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>
          Portal Sistem
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          {isRegister ? 'Pendaftaran Akun Baru' : 'Pendaftaran Magang & Penelitian'}
        </p>

        
        {pesanError && (
          <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px', fontSize: '14px', textAlign: 'center' }}>
            {pesanError}
          </div>
        )}
        
        {pesanSukses && (
          <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '5px', fontSize: '14px', textAlign: 'center' }}>
            {pesanSukses}
          </div>
        )}
        
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {isRegister && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap..." 
                value={namaLengkap} 
                onChange={(e) => setNamaLengkap(e.target.value)} 
                required={isRegister} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Email</label>
            <input 
              type="email" 
              placeholder="Masukkan email..." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Password (Min. 6 Karakter)</label>
            <input 
              type="password" 
              placeholder="Masukkan password..." 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '10px',
              padding: '12px', 
              background: loading ? '#ccc' : '#0056b3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? 'Memproses...' : (isRegister ? 'Daftar Sekarang' : 'Masuk')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setPesanError(''); // Bersihkan error saat ganti mode
              setPesanSukses('');
            }} 
            style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'}
          </button>
        </div>

      </div>
    </div>
  );
}