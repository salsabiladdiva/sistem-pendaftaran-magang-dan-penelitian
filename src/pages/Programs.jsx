import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

export default function ProgramsPage() {
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState({});
  const [hasPendingRegistration, setHasPendingRegistration] = useState(false);

  useEffect(() => {
    getCurrentUser();
    fetchPrograms();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchUserRegistrations(session.user.id);
    }
  };

  const fetchUserRegistrations = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('program_id, status')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) throw error;
      
      // Create object: { program_id: status }
      const registrations = {};
      let hasPending = false;
      
      data?.forEach(reg => {
        registrations[reg.program_id] = reg.status;
        if (reg.status === 'pending') {
          hasPending = true;
        }
      });
      
      setUserRegistrations(registrations);
      setHasPendingRegistration(hasPending);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
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
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = 
      program.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || program.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleRegister = async (programId) => {
    if (!user) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    try {
      // Check if user has ANY pending registration (global check)
      const { data: pendingRegistrations } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .is('deleted_at', null);

      if (pendingRegistrations && pendingRegistrations.length > 0) {
        const pendingProgram = pendingRegistrations[0];
        alert(`Anda masih memiliki pendaftaran yang menunggu verifikasi. Harap tunggu sampai pendaftaran Anda diproses sebelum mendaftar ke program lain.`);
        return;
      }

      // Check if already registered in this specific program with non-rejected status
      const { data: existing } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .neq('status', 'rejected')
        .is('deleted_at', null);

      if (existing && existing.length > 0) {
        const status = existing[0].status;
        alert(
          status === 'pending' 
            ? 'Pendaftaran Anda masih dalam proses verifikasi'
            : 'Anda sudah diterima di program ini'
        );
        return;
      }

      // Create registration
      const { error } = await supabase
        .from('registrations')
        .insert([{
          user_id: user.id,
          program_id: programId,
          status: 'pending',
          submission_date: new Date().toISOString()
        }]);

      if (error) throw error;
      alert('Pendaftaran berhasil! Status Anda: Menunggu Verifikasi');
      fetchUserRegistrations(user.id);
      fetchPrograms();
    } catch (error) {
      console.error('Error registering:', error);
      alert('Gagal mendaftar: ' + error.message);
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
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">📋 Semua Program</h1>
          <p className="text-indigo-100">Jelajahi peluang magang dan penelitian terbaik</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
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
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Semua Tipe</option>
            <option value="internship">🏢 Magang</option>
            <option value="research">🔬 Penelitian</option>
          </select>
        </div>

        {/* Programs List */}
        {filteredPrograms.length > 0 ? (
          <div className="space-y-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="card hover:shadow-xl transition-all"
                onClick={() => setSelectedProgram(selectedProgram?.id === program.id ? null : program)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1 cursor-pointer">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{program.title}</h3>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        program.type === 'internship' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {program.type === 'internship' ? '🏢 Magang' : '🔬 Penelitian'}
                      </span>
                      {program.status === 'active' && (
                        <span className="px-2 md:px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          ✅ Aktif
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 font-semibold mb-2 text-sm md:text-base">{program.company_name}</p>
                    <p className="text-gray-700 mb-3 text-sm md:text-base line-clamp-2">{program.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <span className="mr-1 md:mr-2">📍</span> 
                        <span className="truncate">{program.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-1 md:mr-2">👥</span> 
                        <span>{program.capacity - program.registered_count} / {program.capacity}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-1 md:mr-2">📅</span> 
                        <span className="truncate">{new Date(program.start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-1 md:mr-2">🔚</span> 
                        <span className="truncate">{new Date(program.end_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {hasPendingRegistration ? (
                    <div className="flex flex-col gap-2">
                      <button
                        disabled
                        className="w-full md:w-auto px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed whitespace-nowrap"
                      >
                        ⏳ Ada Pendaftaran Menunggu
                      </button>
                      <p className="text-xs text-red-500 font-semibold">
                        Anda masih memiliki pendaftaran yang sedang diverifikasi. Tunggu hasilnya sebelum mendaftar ke program lain.
                      </p>
                    </div>
                  ) : userRegistrations[program.id] && userRegistrations[program.id] !== 'rejected' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        disabled
                        className="w-full md:w-auto px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed whitespace-nowrap"
                      >
                        ✅ Sudah Terdaftar
                      </button>
                      <p className="text-xs text-gray-500">
                        Status: <span className={`font-semibold ${
                          userRegistrations[program.id] === 'pending' ? 'text-yellow-600' :
                          userRegistrations[program.id] === 'approved' ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {userRegistrations[program.id] === 'pending' ? 'Menunggu' :
                           userRegistrations[program.id] === 'approved' ? 'Diterima' :
                           'Ditolak'}
                        </span>
                      </p>
                    </div>
                  ) : userRegistrations[program.id] === 'rejected' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleRegister(program.id)}
                        className="w-full md:w-auto btn-primary whitespace-nowrap"
                      >
                        Daftar Lagi
                      </button>
                      <p className="text-xs text-red-500">
                        Pendaftaran sebelumnya ditolak, Anda bisa mendaftar lagi
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(program.id)}
                      className="w-full md:w-auto btn-primary whitespace-nowrap"
                    >
                      Daftar Sekarang
                    </button>
                  )}
                </div>

                {/* Capacity Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Kapasitas Daftar</span>
                    <span>{Math.round((program.registered_count / program.capacity) * 100)}% Penuh</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (program.registered_count / program.capacity) > 0.8
                          ? 'bg-red-500'
                          : (program.registered_count / program.capacity) > 0.5
                          ? 'bg-yellow-500'
                          : 'bg-gradient-to-r from-indigo-600 to-pink-600'
                      }`}
                      style={{ width: `${Math.min((program.registered_count / program.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <span className="font-semibold">{program.capacity - program.registered_count} kuota tersisa</span>
                  </div>
                </div>

                {/* Expandable Requirements */}
                {selectedProgram?.id === program.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Persyaratan:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{program.requirements}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">Tidak ada program yang sesuai dengan filter Anda</p>
          </div>
        )}
      </div>
    </div>
  );
}
