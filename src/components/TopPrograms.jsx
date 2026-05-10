import { useEffect, useState } from 'react';

export default function TopPrograms({ registrations }) {
  const [topPrograms, setTopPrograms] = useState([]);

  useEffect(() => {
    if (registrations && registrations.length > 0) {
      // Group registrations by program
      const programCounts = {};
      
      registrations.forEach((reg) => {
        const programId = reg.program_id;
        const programTitle = reg.programs?.title || 'Unknown';
        const companyName = reg.programs?.company_name || '';
        
        if (!programCounts[programId]) {
          programCounts[programId] = {
            id: programId,
            title: programTitle,
            company_name: companyName,
            count: 0,
          };
        }
        programCounts[programId].count += 1;
      });

      // Convert to array, sort by count, and take top 3
      const sorted = Object.values(programCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setTopPrograms(sorted);
    }
  }, [registrations]);

  const medals = ['🥇', '🥈', '🥉'];
  const colors = ['from-yellow-50 to-yellow-100', 'from-gray-50 to-gray-100', 'from-orange-50 to-orange-100'];
  const borders = ['border-yellow-600', 'border-gray-600', 'border-orange-600'];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">🏆 Top 3 Program Terbanyak Pendaftar</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topPrograms.length > 0 ? (
          topPrograms.map((program, index) => (
            <div
              key={program.id}
              className={`card bg-gradient-to-br ${colors[index]} border-l-4 ${borders[index]} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{medals[index]}</span>
                <span className="text-xs font-bold bg-white px-3 py-1 rounded-full">
                  Rank #{index + 1}
                </span>
              </div>
              
              <p className="text-gray-700 font-semibold text-lg mb-1">
                {program.title}
              </p>
              
              {program.company_name && (
                <p className="text-sm text-gray-600 mb-3">
                  {program.company_name}
                </p>
              )}
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">
                  {program.count}
                </span>
                <span className="text-sm text-gray-600">
                  pendaftar
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            <p>Belum ada data pendaftaran</p>
          </div>
        )}
      </div>
    </div>
  );
}
