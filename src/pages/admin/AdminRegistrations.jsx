import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from '../../components/Navbar';

export default function AdminRegistrations() {
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    getCurrentUser();
    fetchRegistrations();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          users!registrations_user_id_fkey (email, name),
          programs (title, company_name, type)
        `)
        .is('deleted_at', null)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Get registration data to access program info
      const { data: regData } = await supabase
        .from('registrations')
        .select('*, programs(capacity, registered_count)')
        .eq('id', id)
        .single();

      if (!regData) throw new Error('Registrasi tidak ditemukan');

      // Get old status
      const oldStatus = regData.status;

      // Update registration status
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ 
          status: newStatus,
          review_date: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Handle kuota changes
      if (oldStatus !== 'approved' && newStatus === 'approved') {
        // Status changed TO approved - decrease kuota
        const currentKuota = regData.programs?.capacity || 0;
        const registeredCount = (regData.programs?.registered_count || 0) + 1;
        const newKuota = currentKuota - 1;

        if (newKuota >= 0) {
          const { error: kuotaError } = await supabase
            .from('programs')
            .update({ registered_count: registeredCount })
            .eq('id', regData.program_id);

          if (kuotaError) throw kuotaError;
        }
      } else if (oldStatus === 'approved' && newStatus !== 'approved') {
        // Status changed FROM approved - increase kuota back
        const registeredCount = Math.max((regData.programs?.registered_count || 1) - 1, 0);
        const { error: kuotaError } = await supabase
          .from('programs')
          .update({ registered_count: registeredCount })
          .eq('id', regData.program_id);

        if (kuotaError) throw kuotaError;
      }

      alert('Status berhasil diubah');
      fetchRegistrations();
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal: ' + error.message);
    }
  };

  const handleAddNote = async (id) => {
    const note = prompt('Masukkan catatan:');
    if (note === null) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ notes: note })
        .eq('id', id);

      if (error) throw error;
      alert('Catatan berhasil ditambahkan');
      fetchRegistrations();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!confirm('Soft delete registrasi ini?')) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      alert('Registrasi di-soft delete');
      fetchRegistrations();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (!confirm('Yakin hard delete? Ini tidak bisa dibatalkan!')) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Registrasi berhasil dihapus permanen');
      fetchRegistrations();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.programs?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold">📋 Kelola Registrasi</h1>
          <p className="text-indigo-100">Admin Panel - Verifikasi Pendaftaran Peserta</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
            <p className="text-gray-600 font-semibold">Total</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-600">
            <p className="text-gray-600 font-semibold">Menunggu</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
            <p className="text-gray-600 font-semibold">Diterima</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
            <p className="text-gray-600 font-semibold">Ditolak</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari pendaftar atau program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">Semua Status</option>
            <option value="pending">⏳ Menunggu Verifikasi</option>
            <option value="approved">✅ Diterima</option>
            <option value="rejected">❌ Ditolak</option>
          </select>
        </div>

        {/* Registrations Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden text-xs md:text-base">
            <thead className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left">Pendaftar</th>
                <th className="px-3 md:px-6 py-3 text-left hidden md:table-cell">Program</th>
                <th className="px-3 md:px-6 py-3 text-left">Tanggal</th>
                <th className="px-3 md:px-6 py-3 text-center">Status</th>
                <th className="px-3 md:px-6 py-3 text-center text-xs md:text-base">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4">
                    <div>
                      <p className="font-semibold text-xs md:text-base">{reg.users?.name}</p>
                      <p className="text-xs text-gray-600 truncate">{reg.users?.email}</p>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                    <div>
                      <p className="font-semibold text-sm">{reg.programs?.title}</p>
                      <p className="text-xs text-gray-600">{reg.programs?.company_name}</p>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-xs md:text-sm whitespace-nowrap">
                    {new Date(reg.submission_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center">
                    <select
                      value={reg.status}
                      onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                      className={`px-2 md:px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                        reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="pending">⏳ Menunggu</option>
                      <option value="approved">✅ Terima</option>
                      <option value="rejected">❌ Tolak</option>
                    </select>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center">
                    <div className="flex flex-col md:flex-row gap-1 justify-center">
                      <button
                        onClick={() => handleAddNote(reg.id)}
                        className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs md:text-sm"
                        title="Tambah catatan"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => handleSoftDelete(reg.id)}
                        className="px-2 md:px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-xs md:text-sm"
                        title="Soft delete"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => handleHardDelete(reg.id)}
                        className="px-2 md:px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs md:text-sm"
                        title="Hard delete"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
