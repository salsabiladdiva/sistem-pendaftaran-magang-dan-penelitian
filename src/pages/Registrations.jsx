import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

export default function RegistrationsPage() {
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    } else {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          programs (
            id,
            title,
            type,
            company_name,
            location,
            start_date,
            end_date
          ),
          users!registrations_reviewed_by_fkey (
            email,
            name
          )
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (registrationId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pendaftaran ini?')) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', registrationId);

      if (error) throw error;
      alert('Pendaftaran berhasil dibatalkan');
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Gagal membatalkan: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    reg.programs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.programs?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold mb-2">📝 Pendaftaran Saya</h1>
          <p className="text-indigo-100">Kelola dan pantau status pendaftaran Anda</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari program atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* Registrations */}
        {filteredRegistrations.length > 0 ? (
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <div key={registration.id} className="card hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {registration.programs?.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        registration.programs?.type === 'internship'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {registration.programs?.type === 'internship' ? '🏢 Magang' : '🔬 Penelitian'}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{registration.programs?.company_name}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>{registration.programs?.location}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>{new Date(registration.submission_date).toLocaleDateString('id-ID')}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🔚</span>{new Date(registration.programs?.end_date).toLocaleDateString('id-ID')}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">{getStatusIcon(registration.status)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(registration.status)}`}>
                          {registration.status === 'pending' && 'Menunggu'}
                          {registration.status === 'approved' && 'Diterima'}
                          {registration.status === 'rejected' && 'Ditolak'}
                        </span>
                      </div>
                    </div>

                    {registration.notes && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-800 mb-3">
                        <p className="font-semibold">Catatan Verifikator:</p>
                        <p>{registration.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button className="btn-secondary text-sm py-2 flex-1">
                      Detail
                    </button>
                    {registration.status === 'pending' && (
                      <button
                        onClick={() => handleSoftDelete(registration.id)}
                        className="btn-danger text-sm py-2 flex-1"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">Anda belum melakukan pendaftaran apapun</p>
            <a href="/programs" className="mt-4 inline-block btn-primary">
              Lihat Program Tersedia
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
