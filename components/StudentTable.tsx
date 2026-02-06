import React from 'react';
import { MergedStudent, SortOption } from '../types';

interface StudentTableProps {
  students: MergedStudent[];
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, currentSort, onSortChange }) => {
  
  const getSortIcon = (option: SortOption, col: string) => {
     // Simple icon logic
     if (currentSort.includes(col)) {
         return currentSort.includes('DESC') ? '↓' : '↑';
     }
     return '↕';
  };

  const getRowStyle = (index: number) => {
    // Only apply coloring if sorting by Points (Descending)
    if (currentSort !== SortOption.POINTS_DESC) {
        return "hover:bg-gray-50";
    }

    if (index === 0) return "bg-green-200 hover:bg-green-300 border-l-4 border-green-600"; // Rank 1
    if (index === 1) return "bg-green-100 hover:bg-green-200 border-l-4 border-green-500"; // Rank 2
    if (index === 2) return "bg-green-50 hover:bg-green-100 border-l-4 border-green-400";  // Rank 3
    
    return "hover:bg-gray-50";
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No.
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange(SortOption.NAME_ASC)}
            >
              Nama {getSortIcon(currentSort, 'NAME')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kelas
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange(SortOption.STARS_DESC)}
            >
              Bintang {getSortIcon(currentSort, 'STARS')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange(SortOption.RECORDS_DESC)}
            >
              Rekod {getSortIcon(currentSort, 'RECORDS')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSortChange(SortOption.POINTS_DESC)}
            >
              Mata {getSortIcon(currentSort, 'POINTS')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Tiada data untuk dipaparkan. Sila muat naik fail CSV.
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={index} className={`transition-colors duration-150 ${getRowStyle(index)}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    {/* Add trophy icon for Top 1 */}
                    {index === 0 && currentSort === SortOption.POINTS_DESC && (
                       <span className="ml-2 text-yellow-600" title="Juara">
                         🏆
                       </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{student.idNumber || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.className === 'TIADA KELAS' ? 'bg-red-100 text-red-800' : 'bg-white bg-opacity-50 border border-gray-300 text-gray-800'}`}>
                    {student.className}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {student.stars}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {student.records}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  {student.points}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};