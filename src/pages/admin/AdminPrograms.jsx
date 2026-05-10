import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from '../../components/Navbar';
import TopProgramsAdmin from '../../components/TopProgramsAdmin';

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
      <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">⚙️ Kelola Program</h1>
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
            className="btn-primary w-full sm:w-auto"
          >
            ➕ Tambah Program
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top 3 Programs */}
        <TopProgramsAdmin programs={programs} />

        {/* Form */}
        {showForm && (
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">
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
                  <option value="internship">Magang</option>
                  <option value="research">Penelitian</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input-field"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                  className="input-field"
                />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                  className="input-field"
                />
              </div>
              <textarea
                placeholder="Deskripsi Program"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="input-field min-h-24"
              />
              <textarea
                placeholder="Persyaratan (pisahkan dengan baris baru)"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                className="input-field min-h-24"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="btn-primary">
                  {editingId ? '💾 Update' : '➕ Tambah'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  ❌ Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Program</th>
                <th className="px-6 py-3 text-left">Perusahaan</th>
                <th className="px-6 py-3 text-left">Tipe</th>
                <th className="px-6 py-3 text-center">Kapasitas</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{program.title}</td>
                  <td className="px-6 py-4">{program.company_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      program.type === 'internship' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {program.type === 'internship' ? 'Magang' : 'Penelitian'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">{program.registered_count} / {program.capacity}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {program.status === 'active' ? '✅ Aktif' : '⏸️ Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(program)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleSoftDelete(program.id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        🗑️ Soft
                      </button>
                      <button
                        onClick={() => handleHardDelete(program.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
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
