import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [programSearch, setProgramSearch] = useState('');
  const [formProgramSearch, setFormProgramSearch] = useState('');
  const [showProgramSuggestions, setShowProgramSuggestions] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [viewMode, setViewMode] = useState('active'); 
  const [selectedProgram, setSelectedProgram] = useState('');
  const [judulBaru, setJudulBaru] = useState('');
  const [jenisBaru, setJenisBaru] = useState('Magang');
  const [kuotaBaru, setKuotaBaru] = useState(5);

  const isAdmin = sessionUser?.email === 'admin@gmail.com';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSessionUser(user);
        fetchData(user);
      }
    });
  }, []);

  const fetchData = async (user) => {
    setLoading(true);
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('nama_lengkap')
      .eq('id', user.id)
      .single();
      
    if (profileData) setUserProfile(profileData);

    const { data: programData } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
    if (programData) setPrograms(programData);

    let query = supabase
      .from('applications')
      .select(`
        id, status, deleted_at,
        profiles ( id, nama_lengkap ),
        programs ( id, judul, jenis, kuota )
      `)
      .order('created_at', { ascending: false });

    // REVISI LOGIKA: Mahasiswa melihat semua riwayatnya (tanpa filter deleted_at)
    if (user.email !== 'admin@gmail.com') {
      query = query.eq('profile_id', user.id);
    }

    const { data: appData } = await query;
    if (appData) setApplications(appData);
    
    setLoading(false);
  };

  const handleTambahProgram = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('programs').insert([{ judul: judulBaru, jenis: jenisBaru, kuota: kuotaBaru }]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Program berhasil ditambahkan!');
      setJudulBaru('');
      fetchData(sessionUser); 
    }
  };

  const handleHapusProgram = async (id) => {
    if (window.confirm('Yakin ingin menghapus program ini secara permanen?')) {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) alert('Gagal menghapus program: ' + error.message);
      else {
        alert('Program berhasil dihapus permanen!');
        fetchData(sessionUser); 
      }
    }
  };

  const handleUpdateStatus = async (id, programId, statusBaru, statusLama) => {
    if (!programId) {
      alert('⚠️ Gagal: ID Program tidak ditemukan!');
      return;
    }

    const { error } = await supabase.from('applications').update({ status: statusBaru }).eq('id', id);
    
    if (!error) {
      if (statusBaru === 'Diterima' && statusLama !== 'Diterima') {
        const { data: program } = await supabase.from('programs').select('kuota').eq('id', programId).single();
        if (program && program.kuota > 0) {
          await supabase.from('programs').update({ kuota: parseInt(program.kuota) - 1 }).eq('id', programId);
        }
      } 
      else if (statusLama === 'Diterima' && statusBaru !== 'Diterima') {
        const { data: program } = await supabase.from('programs').select('kuota').eq('id', programId).single();
        if (program) {
          await supabase.from('programs').update({ kuota: parseInt(program.kuota) + 1 }).eq('id', programId);
        }
      }
      fetchData(sessionUser);
    } else {
      alert('Gagal update status: ' + error.message);
    }
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm('Pindahkan data pendaftaran ini ke Archive?')) {
      const { error } = await supabase.from('applications').update({ deleted_at: new Date() }).eq('id', id);
      if (!error) fetchData(sessionUser);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('Kembalikan data ini ke daftar Aktif?')) {
      const { error } = await supabase.from('applications').update({ deleted_at: null }).eq('id', id);
      if (!error) fetchData(sessionUser);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm('⚠️ PERINGATAN! ⚠️\nData akan dihapus permanen! Lanjutkan?')) {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (!error) fetchData(sessionUser);
    }
  };

  const handleDaftar = async (e) => {
    e.preventDefault();
    if (!selectedProgram) {
      alert('Pilih program terlebih dahulu!');
      return;
    }
    const { error } = await supabase.from('applications').insert([
      { profile_id: sessionUser.id, program_id: selectedProgram, status: 'Menunggu Verifikasi' }
    ]);
    if (error) alert('Gagal mendaftar!');
    else {
      alert('Berhasil Mendaftar!');
      fetchData(sessionUser); 
      setActivePage('dashboard'); 
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const filteredData = applications.filter((app) => {
    // REVISI LOGIKA: Admin memfilter tab, Mahasiswa melihat semua
    const isTrashMatch = isAdmin 
      ? (viewMode === 'trash' ? app.deleted_at !== null : app.deleted_at === null)
      : true;

    if (!isTrashMatch) return false;

    const nama = app.profiles?.nama_lengkap?.toLowerCase() || '';
    const judul = app.programs?.judul?.toLowerCase() || '';
    return nama.includes(searchQuery.toLowerCase()) || judul.includes(searchQuery.toLowerCase());
  });

  const filteredPrograms = programs.filter((prog) => (
    prog.judul?.toLowerCase().includes(programSearch.toLowerCase()) ||
    prog.jenis?.toLowerCase().includes(programSearch.toLowerCase())
  ));

  const suggestedProgramsForForm = programs.filter((prog) => {
    const keyword = formProgramSearch.toLowerCase();
    if (!keyword) return false;
    return prog.judul?.toLowerCase().includes(keyword) || prog.jenis?.toLowerCase().includes(keyword);
  });

  if (!sessionUser) return <div style={{ padding: '20px', textAlign: 'center' }}>Memuat sesi...</div>;

  const renderContent = () => {
    if (activePage === 'program') {
      return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Daftar Program Tersedia</h2>
          <input type="text" placeholder="Cari program..." value={programSearch} onChange={(e) => setProgramSearch(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '15px', borderRadius: '5px', border: '1px solid #ccc' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {filteredPrograms.map(prog => (
              <div key={prog.id} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{prog.judul}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Kategori:</strong> {prog.jenis}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Sisa Kuota:</strong> {prog.kuota} Peserta</p>
                {!isAdmin && (
                  <button onClick={() => { setSelectedProgram(prog.id); setFormProgramSearch(`${prog.judul} (${prog.jenis})`); setActivePage('dashboard'); }} style={{ marginTop: '15px', backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>Daftar Program Ini</button>
                )}
                {isAdmin && (
                  <button onClick={() => handleHapusProgram(prog.id)} style={{ marginTop: '15px', backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>🗑️ Hapus Program</button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activePage === 'panduan') {
      return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Buku Panduan Sistem</h2>
          <div style={{ lineHeight: '1.6', color: '#334155' }}>
            <h3>Bagi Mahasiswa:</h3>
            <ol>
              <li>Pilih menu <b>Program Magang</b> untuk melihat daftar program.</li>
              <li>Daftar melalui formulir di halaman <b>Dashboard</b>.</li>
              <li>Pantau status di tabel Riwayat Pendaftaran.</li>
            </ol>
            <h3>Bagi Administrator:</h3>
            <ol>
              <li>Gunakan <b>Dashboard</b> untuk mengelola program dan verifikasi.</li>
              <li>Fitur <b>Archive</b> menyembunyikan data dari daftar aktif Admin.</li>
              <li>Fitur <b>Hapus Permanen</b> menghapus data sepenuhnya.</li>
            </ol>
          </div>
        </div>
      );
    }

    return (
      <>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px', borderLeft: isAdmin ? '5px solid #0f172a' : '5px solid #0284c7' }}>
          <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
            Selamat datang, {userProfile ? userProfile.nama_lengkap : 'Pengguna'}! 👋
          </h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            Anda masuk sebagai <span style={{ fontWeight: 'bold', color: isAdmin ? '#dc2626' : '#0284c7' }}>{isAdmin ? 'Administrator' : 'Mahasiswa'}</span>.
          </p>
        </div>

        {isAdmin ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Buat Program Baru</h3>
            <form onSubmit={handleTambahProgram} style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Judul Program" value={judulBaru} onChange={(e) => setJudulBaru(e.target.value)} required style={{ flex: 2, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <select value={jenisBaru} onChange={(e) => setJenisBaru(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="Magang">Magang</option>
                <option value="Penelitian">Penelitian</option>
              </select>
              <input type="number" placeholder="Kuota" value={kuotaBaru} onChange={(e) => setKuotaBaru(e.target.value)} min="1" required style={{ width: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan</button>
            </form>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Formulir Pendaftaran</h3>
            <form onSubmit={handleDaftar} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input type="text" placeholder="Ketik nama program..." value={formProgramSearch} onChange={(e) => { setFormProgramSearch(e.target.value); setSelectedProgram(''); setShowProgramSuggestions(true); }} onFocus={() => setShowProgramSuggestions(true)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                {showProgramSuggestions && formProgramSearch && (
                  <div style={{ position: 'absolute', top: '45px', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', zIndex: 999, maxHeight: '200px', overflowY: 'auto' }}>
                    {suggestedProgramsForForm.length > 0 ? suggestedProgramsForForm.map((prog) => (
                      <div key={prog.id} onClick={() => { setSelectedProgram(prog.id); setFormProgramSearch(`${prog.judul} (${prog.jenis})`); setShowProgramSuggestions(false); }} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <b>{prog.judul}</b> <br/><small>{prog.jenis} • Kuota: {prog.kuota}</small>
                      </div>
                    )) : <div style={{ padding: '10px', color: '#64748b' }}>Program tidak ditemukan.</div>}
                  </div>
                )}
              </div>
              <button type="submit" style={{ backgroundColor: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Daftar Sekarang</button>
            </form>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0' }}>{isAdmin ? 'Manajemen Data Pendaftar' : 'Riwayat Pendaftaran Saya'}</h3>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setViewMode('active')} style={{ padding: '8px 15px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: viewMode === 'active' ? '#e0f2fe' : '#f1f5f9', color: viewMode === 'active' ? '#0284c7' : '#64748b' }}>🟢 Data Aktif</button>
                  <button onClick={() => setViewMode('trash')} style={{ padding: '8px 15px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: viewMode === 'trash' ? '#fee2e2' : '#f1f5f9', color: viewMode === 'trash' ? '#dc2626' : '#64748b' }}>📦 Archive</button>
                </div>
              )}
            </div>
            <input type="text" placeholder="Cari nama/program..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>Nama Peserta</th>
                <th style={{ padding: '12px' }}>Program</th>
                <th style={{ padding: '12px' }}>Kategori</th>
                <th style={{ padding: '12px' }}>Status</th>
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Aksi Admin</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Memuat...</td></tr> : null}
              {filteredData.length > 0 ? filteredData.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0', opacity: viewMode === 'trash' ? 0.6 : 1 }}>
                  <td style={{ padding: '12px' }}>{app.profiles?.nama_lengkap}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{app.programs?.judul}</td>
                  <td style={{ padding: '12px' }}>{app.programs?.jenis}</td>
                  <td style={{ padding: '12px' }}>
                    {isAdmin && viewMode === 'active' ? (
                      <select 
                        value={app.status} 
                        onChange={(e) => handleUpdateStatus(app.id, app.programs?.id, e.target.value, app.status)} 
                        style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                      >
                        <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                        <option value="Diterima">Diterima</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    ) : (
                      <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold', backgroundColor: app.status === 'Diterima' ? '#dcfce7' : app.status === 'Ditolak' ? '#fee2e2' : '#fef9c3', color: app.status === 'Diterima' ? '#166534' : app.status === 'Ditolak' ? '#991b1b' : '#854d0e' }}>
                        {viewMode === 'trash' ? 'Diarsipkan' : app.status}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {viewMode === 'active' ? (
                        <button onClick={() => handleSoftDelete(app.id)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Archive</button>
                      ) : (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button onClick={() => handleRestore(app.id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Restore</button>
                          <button onClick={() => handleHardDelete(app.id)} style={{ backgroundColor: '#b91c1c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hapus Permanen</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )) : !loading && <tr><td colSpan={isAdmin ? "5" : "4"} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>{viewMode === 'trash' ? 'Archive kosong.' : 'Belum ada data pendaftaran.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial' }}>
      <nav style={{ backgroundColor: isAdmin ? '#0f172a' : '#0284c7', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Portal Magang</h2>
          <div style={{ display: 'flex', gap: '20px', fontSize: '15px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('dashboard'); }} style={{ textDecoration: 'none', fontWeight: 'bold', color: activePage === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.6)', borderBottom: activePage === 'dashboard' ? '2px solid white' : 'none', paddingBottom: '3px' }}>Dashboard</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('program'); }} style={{ textDecoration: 'none', fontWeight: 'bold', color: activePage === 'program' ? '#fff' : 'rgba(255,255,255,0.6)', borderBottom: activePage === 'program' ? '2px solid white' : 'none', paddingBottom: '3px' }}>Program Magang</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('panduan'); }} style={{ textDecoration: 'none', fontWeight: 'bold', color: activePage === 'panduan' ? '#fff' : 'rgba(255,255,255,0.6)', borderBottom: activePage === 'panduan' ? '2px solid white' : 'none', paddingBottom: '3px' }}>Panduan</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px' }}>Akses: {isAdmin ? 'Administrator' : 'Mahasiswa'}</span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </div>
      </nav>
      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        {renderContent()}
      </div>
    </div>
  );
}