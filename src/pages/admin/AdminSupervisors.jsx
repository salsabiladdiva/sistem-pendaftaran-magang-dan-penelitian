import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from '../../components/Navbar';

export default function AdminSupervisors() {
  const [user, setUser] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    expertise: ''
  });

  useEffect(() => {
    getCurrentUser();
    fetchSupervisors();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisors')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('supervisors')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        alert('Pembimbing berhasil diubah');
      } else {
        const { error } = await supabase
          .from('supervisors')
          .insert([formData]);
        if (error) throw error;
        alert('Pembimbing berhasil ditambahkan');
      }
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        expertise: ''
      });
      setShowForm(false);
      setEditingId(null);
      fetchSupervisors();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const handleEdit = (supervisor) => {
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone || '',
      department: supervisor.department,
      expertise: supervisor.expertise || ''
    });
    setEditingId(supervisor.id);
    setShowForm(true);
  };

  const handleSoftDelete = async (id) => {
    if (!confirm('Soft delete pembimbing ini?')) return;
    try {
      const { error } = await supabase
        .from('supervisors')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      alert('Pembimbing di-soft delete');
      fetchSupervisors();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (!confirm('Yakin hard delete? Ini tidak bisa dibatalkan!')) return;
    try {
      const { error } = await supabase
        .from('supervisors')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Pembimbing berhasil dihapus permanen');
      fetchSupervisors();
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
            <h1 className="text-4xl font-bold">👨‍🏫 Kelola Pembimbing</h1>
            <p className="text-indigo-100">Admin Panel - Manajemen Data Pembimbing/Mentor</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                department: '',
                expertise: ''
              });
            }}
            className="btn-primary"
          >
            ➕ Tambah Pembimbing
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingId ? '✏️ Edit Pembimbing' : '➕ Pembimbing Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="input-field"
                />
                <input
                  type="tel"
                  placeholder="Nomor Telepon"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Departemen/Divisi"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                  className="input-field"
                />
              </div>
              <textarea
                placeholder="Keahlian/Bidang Keahlian"
                value={formData.expertise}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                className="input-field min-h-24"
              />
              <div className="flex gap-4">
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

        {/* Supervisors Grid */}
        {supervisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supervisors.map((supervisor) => (
              <div key={supervisor.id} className="card hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{supervisor.name}</h3>
                    <p className="text-sm text-indigo-600 font-semibold">{supervisor.department}</p>
                  </div>
                  <span className="text-2xl">👨‍🏫</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <span className="mr-2">📧</span> {supervisor.email}
                  </p>
                  {supervisor.phone && (
                    <p className="flex items-center">
                      <span className="mr-2">📞</span> {supervisor.phone}
                    </p>
                  )}
                  {supervisor.expertise && (
                    <p className="flex items-start">
                      <span className="mr-2">🎯</span>
                      <span>{supervisor.expertise}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(supervisor)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleSoftDelete(supervisor.id)}
                    className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm font-semibold"
                  >
                    🗑️ Soft
                  </button>
                  <button
                    onClick={() => handleHardDelete(supervisor.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm font-semibold"
                  >
                    ❌ Hard
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <p className="text-gray-500 text-lg">Tidak ada pembimbing yang terdaftar</p>
          </div>
        )}
      </div>
    </div>
  );
}
