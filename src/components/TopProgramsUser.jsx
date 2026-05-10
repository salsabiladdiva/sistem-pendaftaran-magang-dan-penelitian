import { useEffect, useState } from 'react';

export default function TopProgramsUser({ applications, programs }) {
  const [topPrograms, setTopPrograms] = useState([]);

  useEffect(() => {
    if (applications && programs && applications.length > 0) {
      // Group applications by program
      const programCounts = {};
      
      applications.forEach((app) => {
        const programId = app.program_id;
        const program = programs.find(p => p.id === programId);
        
        if (program && !programCounts[programId]) {
          programCounts[programId] = {
            id: programId,
            judul: program.judul,
            jenis: program.jenis,
            count: 0,
          };
        }
        if (program) {
          programCounts[programId].count += 1;
        }
      });

      // Convert to array, sort by count, and take top 3
      const sorted = Object.values(programCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setTopPrograms(sorted);
    }
  }, [applications, programs]);

  const medals = ['🥇', '🥈', '🥉'];
  const colors = ['from-yellow-50 to-yellow-100', 'from-gray-50 to-gray-100', 'from-orange-50 to-orange-100'];
  const borders = ['border-yellow-600', 'border-gray-600', 'border-orange-600'];

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }} className="dashboard-card">
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}>🏆 Top 3 Program Terbanyak Pendaftar</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {topPrograms.length > 0 ? (
          topPrograms.map((program, index) => (
            <div
              key={program.id}
              style={{
                border: '1px solid #e2e8f0',
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: ['#fef3c7', '#f3f4f6', '#fed7aa'][index],
                borderLeft: `4px solid ${['#ca8a04', '#6b7280', '#ea580c'][index]}`,
              }}
              className="dashboard-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <span style={{ fontSize: '32px' }}>{medals[index]}</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: 'white', padding: '4px 12px', borderRadius: '12px' }}>
                  Rank #{index + 1}
                </span>
              </div>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                {program.judul}
              </p>
              
              <p style={{ margin: '5px 0 15px 0', fontSize: '12px', color: '#666' }}>
                <strong>Kategori:</strong> {program.jenis}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>
                  {program.count}
                </span>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  pendaftar
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', paddingTop: '20px', paddingBottom: '20px', color: '#999' }}>
            <p>Belum ada data pendaftaran</p>
          </div>
        )}
      </div>
    </div>
  );
}
