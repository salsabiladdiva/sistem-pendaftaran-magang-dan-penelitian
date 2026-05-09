import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

/**
 * SYARAT 7: Halaman ini menampilkan data dari tabel yang berhubungan dengan JOIN lebih dari 2 tabel
 * JOIN yang digunakan: registrations + users (student) + programs + supervisors (via program_supervisors)
 */
export default function DetailsPage() {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCurrentUser();
    fetchDetailsWithJoin();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  // Multiple JOIN Query (4+ tables)
  const fetchDetailsWithJoin = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          submission_date,
          notes,
          motivation_letter,
          users!registrations_user_id_fkey (
            id,
            email,
            name,
            phone,
            major
          ),
          programs (
            id,
            title,
            type,
            company_name,
            location,
            requirements,
            start_date,
            end_date,
            program_supervisors (
              supervisors (
                id,
                name,
                email,
                department,
                expertise
              )
            )
          ),
          users!registrations_reviewed_by_fkey (
            name,
            email
          )
        `)
        .is('deleted_at', null)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setDetails(data || []);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDetails = details.filter((detail) =>
    detail.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    detail.programs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    detail.programs?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">📊 Detail Pendaftaran Lengkap</h1>
          <p className="text-indigo-100">
            Tampilan JOIN dari 4+ tabel: Registrations, Users, Programs, Supervisors
          </p>
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
              placeholder="Cari nama pendaftar, program, atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* Details Cards */}
        {filteredDetails.length > 0 ? (
          <div className="space-y-6">
            {filteredDetails.map((detail) => (
              <div key={detail.id} className="card">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{detail.programs?.title}</h3>
                      <p className="text-gray-600">{detail.programs?.company_name}</p>
                    </div>
                    <div className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-center ${
                      detail.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      detail.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {detail.status === 'pending' && '⏳ Menunggu Verifikasi'}
                      {detail.status === 'approved' && '✅ Diterima'}
                      {detail.status === 'rejected' && '❌ Ditolak'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Information */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">👤</span> Data Pendaftar
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-semibold">Nama:</span> {detail.users?.name}</p>
                      <p><span className="font-semibold">Email:</span> {detail.users?.email}</p>
                      <p><span className="font-semibold">Telepon:</span> {detail.users?.phone || '-'}</p>
                      <p><span className="font-semibold">Jurusan:</span> {detail.users?.major || '-'}</p>
                      <p><span className="font-semibold">Tanggal Daftar:</span> {new Date(detail.submission_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Program Information */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">📋</span> Informasi Program
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-semibold">Tipe:</span> {detail.programs?.type === 'internship' ? '🏢 Magang' : '🔬 Penelitian'}</p>
                      <p><span className="font-semibold">Lokasi:</span> {detail.programs?.location}</p>
                      <p><span className="font-semibold">Mulai:</span> {new Date(detail.programs?.start_date).toLocaleDateString('id-ID')}</p>
                      <p><span className="font-semibold">Selesai:</span> {new Date(detail.programs?.end_date).toLocaleDateString('id-ID')}</p>
                      <p><span className="font-semibold">Persyaratan:</span></p>
                      <p className="text-xs bg-gray-50 p-2 rounded">{detail.programs?.requirements}</p>
                    </div>
                  </div>
                </div>

                {/* Supervisors Information (From program_supervisors table) */}
                {detail.programs?.program_supervisors && detail.programs.program_supervisors.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">👨‍🏫</span> Pembimbing Program
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {detail.programs.program_supervisors.map((ps, idx) => (
                        <div key={idx} className="bg-indigo-50 p-4 rounded-lg">
                          <p className="font-semibold text-indigo-900">{ps.supervisors?.name}</p>
                          <p className="text-sm text-indigo-700">{ps.supervisors?.department}</p>
                          <p className="text-sm text-indigo-600">{ps.supervisors?.email}</p>
                          {ps.supervisors?.expertise && (
                            <p className="text-xs text-indigo-600 mt-2">
                              <span className="font-semibold">Keahlian:</span> {ps.supervisors.expertise}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivation Letter */}
                {detail.motivation_letter && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">📄</span> Surat Motivasi
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                      {detail.motivation_letter}
                    </p>
                  </div>
                )}

                {/* Verification Notes */}
                {detail.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">📝</span> Catatan Verifikator
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded text-sm border-l-4 border-blue-500">
                      {detail.notes}
                    </p>
                    {detail.users && (
                      <p className="text-xs text-gray-600 mt-2">
                        Diverifikasi oleh: <span className="font-semibold">{detail.users.name}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">Tidak ada data yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
