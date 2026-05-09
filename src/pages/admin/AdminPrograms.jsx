import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from '../../components/Navbar';

export default function AdminPrograms() {
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    capacity: '',
    company_name: '',
    location: '',
    start_date: '',
    end_date: '',
    requirements: '',
    status: 'active'
  });

  useEffect(() => {
    getCurrentUser();
    fetchPrograms();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from('programs')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        alert('Program berhasil diubah');
      } else {
        const { error } = await supabase
          .from('programs')
          .insert([{ ...formData, created_by: user.id }]);
        if (error) throw error;
        alert('Program berhasil ditambahkan');
      }
      
      setFormData({
        title: '',
        description: '',
        type: 'internship',
        capacity: '',
        company_name: '',
        location: '',
        start_date: '',
        end_date: '',
        requirements: '',
        status: 'active'
      });
      setShowForm(false);
      setEditingId(null);
      fetchPrograms();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const handleEdit = (program) => {
    setFormData({
      title: program.title,
      description: program.description,
      type: program.type,
      capacity: program.capacity,
      company_name: program.company_name,
      location: program.location,
      start_date: program.start_date?.split('T')[0],
      end_date: program.end_date?.split('T')[0],
      requirements: program.requirements,
      status: program.status
    });
    setEditingId(program.id);
    setShowForm(true);
  };

  const handleSoftDelete = async (id) => {
    if (!confirm('Soft delete program ini?')) return;
    try {
      const { error } = await supabase
        .from('programs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      alert('Program di-soft delete');
      fetchPrograms();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (!confirm('Yakin hard delete? Ini tidak bisa dibatalkan!')) return;
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Program berhasil dihapus permanen');
      fetchPrograms();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
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
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">⚙️ Kelola Program</h1>
            <p className="text-indigo-100">Admin Panel - Manajemen Program Magang & Penelitian</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                title: '',
                description: '',
                type: 'internship',
                capacity: '',
                company_name: '',
                location: '',
                start_date: '',
                end_date: '',
                requirements: '',
                status: 'active'
              });
            }}
            className="btn-primary"
          >
            ➕ Tambah Program
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <div className="card mb-8 border-2 border-indigo-200">
            <h3 className="text-xl md:text-2xl font-bold mb-6">
              {editingId ? '✏️ Edit Program' : '➕ Program Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Judul Program"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Nama Perusahaan"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Lokasi"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Kapasitas"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  required
                  className="input-field"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="input-field"
                >
                  <option value="internship">🏢 Magang</option>
                  <option value="research">🔬 Penelitian</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input-field"
                >
                  <option value="active">✅ Aktif</option>
                  <option value="inactive">⏸️ Tidak Aktif</option>
                </select>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Program</label>
                <textarea
                  placeholder="Deskripsi Program"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="input-field min-h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Persyaratan</label>
                <textarea
                  placeholder="Persyaratan (pisahkan dengan baris baru)"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className="input-field min-h-24"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 md:flex-none">
                  {editingId ? '💾 Update' : '➕ Tambah'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1 md:flex-none"
                >
                  ❌ Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm md:text-base">
            <thead className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left">Program</th>
                <th className="px-3 md:px-6 py-3 text-left hidden md:table-cell">Perusahaan</th>
                <th className="px-3 md:px-6 py-3 text-left">Tipe</th>
                <th className="px-3 md:px-6 py-3 text-center text-xs md:text-base">Kapasitas</th>
                <th className="px-3 md:px-6 py-3 text-center hidden md:table-cell">Status</th>
                <th className="px-3 md:px-6 py-3 text-center text-xs md:text-base">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50 text-xs md:text-base">
                  <td className="px-3 md:px-6 py-4 font-semibold">{program.title}</td>
                  <td className="px-3 md:px-6 py-4 hidden md:table-cell">{program.company_name}</td>
                  <td className="px-3 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                      program.type === 'internship' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {program.type === 'internship' ? 'Magang' : 'Penelitian'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center whitespace-nowrap">
                    <div>
                      <p className="font-semibold">{program.registered_count} / {program.capacity}</p>
                      <p className="text-xs text-gray-600">{program.capacity - program.registered_count} tersisa</p>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center hidden md:table-cell">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                      program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {program.status === 'active' ? '✅ Aktif' : '⏸️ Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-center">
                    <div className="flex flex-col md:flex-row gap-1 justify-center text-xs md:text-sm">
                      <button
                        onClick={() => handleEdit(program)}
                        className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 whitespace-nowrap"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleSoftDelete(program.id)}
                        className="px-2 md:px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 whitespace-nowrap"
                      >
                        🗑️ Soft
                      </button>
                      <button
                        onClick={() => handleHardDelete(program.id)}
                        className="px-2 md:px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 whitespace-nowrap"
                      >
                        ❌ Hard
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
