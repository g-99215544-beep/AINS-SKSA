import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sidebar } from './Sidebar';
import { FileUpload } from './FileUpload';
import { StudentTable } from './StudentTable';
import { fetchClassDataFromFirebase, mergeStudentData } from '../utils/dataProcessing';
import { MergedStudent, SortOption, StudentClassInfo, CLASS_ORDER, StudentPerformance } from '../types';

// Helper for sorting to be used in UI and PDF generation
const getSortedData = (data: MergedStudent[], option: SortOption): MergedStudent[] => {
  const sorted = [...data];
  switch (option) {
    case SortOption.POINTS_DESC:
      return sorted.sort((a, b) => b.points - a.points);
    case SortOption.POINTS_ASC:
      return sorted.sort((a, b) => a.points - b.points);
    case SortOption.STARS_DESC:
      return sorted.sort((a, b) => b.stars - a.stars);
    case SortOption.RECORDS_DESC:
      return sorted.sort((a, b) => b.records - a.records);
    case SortOption.NAME_ASC:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
};

export const Dashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<StudentPerformance[]>([]);
  const [classData, setClassData] = useState<StudentClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.POINTS_DESC);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize Class Data on Mount from Firebase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchClassDataFromFirebase();
        setClassData(data);
      } catch (err) {
        console.error("Failed to load class data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const mergedData = useMemo(() => {
    if (performanceData.length === 0) return [];
    return mergeStudentData(performanceData, classData);
  }, [performanceData, classData]);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!selectedClass) return mergedData;
    return mergedData.filter(s => s.className === selectedClass);
  }, [mergedData, selectedClass]);

  // Sort Data for Table View
  const sortedData = useMemo(() => {
    return getSortedData(filteredData, sortOption);
  }, [filteredData, sortOption]);

  // Stats
  const stats = useMemo(() => {
    const totalStudents = filteredData.length;
    const totalPoints = filteredData.reduce((acc, curr) => acc + curr.points, 0);
    const avgPoints = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : '0';
    const topStudent = sortedData.length > 0 && sortOption === SortOption.POINTS_DESC ? sortedData[0] : null;

    return { totalStudents, totalPoints, avgPoints, topStudent };
  }, [filteredData, sortedData, sortOption]);

  // Extract unique classes for sidebar
  const uniqueClasses = useMemo(() => {
    const classes = new Set(classData.map(c => c.className));
    return Array.from(classes);
  }, [classData]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case SortOption.POINTS_DESC: return 'Mata Tertinggi';
      case SortOption.POINTS_ASC: return 'Mata Terendah';
      case SortOption.STARS_DESC: return 'Bintang Terbanyak';
      case SortOption.RECORDS_DESC: return 'Rekod Terbanyak';
      case SortOption.NAME_ASC: return 'Nama (A-Z)';
      default: return '';
    }
  };

  const handlePrintClick = () => {
    if (selectedClass) {
      generatePDF('single');
    } else {
      setShowPdfModal(true);
    }
  };

  const generatePDF = (mode: 'single' | 'grouped') => {
    const doc = new jsPDF();
    const tableColumn = ["No.", "Nama", "ID DELIMa", "Kelas", "Bintang", "Rekod", "Mata"];
    const sortLabel = getSortLabel(sortOption);
    const dateStr = new Date().toLocaleDateString('ms-MY');

    if (mode === 'single') {
        const title = selectedClass 
            ? `Senarai Murid - ${selectedClass}` 
            : 'Senarai Keseluruhan Murid';
            
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Tarikh: ${dateStr}`, 14, 28);
        doc.text(`Susunan: ${sortLabel}`, 14, 33);

        const tableRows = sortedData.map((student, index) => [
            index + 1,
            student.name,
            student.email,
            student.className,
            student.stars,
            student.records,
            student.points
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [79, 70, 229] },
            alternateRowStyles: { fillColor: [243, 244, 246] },
        });

        doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

    } else {
        const title = 'Laporan Prestasi Mengikut Kelas';
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Tarikh: ${dateStr}`, 14, 28);
        doc.text(`Susunan: ${sortLabel}`, 14, 33);

        let finalY = 40; 

        const allClassesInOrder = [...CLASS_ORDER];
        uniqueClasses.forEach(cls => {
            if (!allClassesInOrder.includes(cls)) {
                allClassesInOrder.push(cls);
            }
        });

        allClassesInOrder.forEach((cls) => {
            const classStudents = mergedData.filter(s => s.className === cls);
            
            if (classStudents.length > 0) {
                const sortedClassStudents = getSortedData(classStudents, sortOption);

                if (finalY > 250) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`KELAS: ${cls}`, 14, finalY);
                doc.setFont("helvetica", "normal");

                const tableRows = sortedClassStudents.map((student, index) => [
                    index + 1, 
                    student.name,
                    student.email,
                    student.className,
                    student.stars,
                    student.records,
                    student.points
                ]);

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: finalY + 5,
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [79, 70, 229] },
                    alternateRowStyles: { fillColor: [243, 244, 246] },
                    didDrawPage: (data) => {
                    }
                });

                // @ts-ignore
                finalY = doc.lastAutoTable.finalY + 15;
            }
        });

        doc.save(`Laporan_Mengikut_Kelas.pdf`);
    }
    
    setShowPdfModal(false);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen relative">
      <Sidebar 
        activeClass={selectedClass} 
        onSelectClass={setSelectedClass} 
        classNameList={uniqueClasses}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             {/* Toggle Sidebar Button */}
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-2 rounded-md hover:bg-gray-200 focus:outline-none transition-colors"
               title={isSidebarOpen ? "Tutup Menu" : "Buka Menu"}
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
             </button>

             <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedClass ? `Kelas: ${selectedClass}` : 'Paparan Keseluruhan'}
                </h2>
                <p className="text-gray-500 mt-1">Data Prestasi dan Kedudukan Murid</p>
                {isLoading && <span className="text-xs text-indigo-600 animate-pulse">Sedang memuat turun data murid...</span>}
             </div>
          </div>

          <div className="flex gap-4">
             <button
               onClick={handlePrintClick}
               disabled={mergedData.length === 0}
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
               </svg>
               Cetak PDF
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-sm font-medium text-gray-500 uppercase">Jumlah Murid</div>
             <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</div>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-sm font-medium text-gray-500 uppercase">Jumlah Mata</div>
             <div className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPoints}</div>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-sm font-medium text-gray-500 uppercase">Purata Mata</div>
             <div className="text-3xl font-bold text-green-600 mt-2">{stats.avgPoints}</div>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-sm font-medium text-gray-500 uppercase">Murid Terbaik</div>
             <div className="text-lg font-bold text-purple-600 mt-2 truncate">
               {stats.topStudent ? stats.topStudent.name : '-'}
             </div>
             <div className="text-xs text-gray-400">
               {stats.topStudent ? `${stats.topStudent.points} Mata` : ''}
             </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
           <FileUpload onDataLoaded={setPerformanceData} />
           
           <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border-b border-gray-200">
             <h3 className="font-semibold text-gray-700">Senarai Murid</h3>
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-500">Susun ikut:</span>
               <select 
                 className="text-sm border-gray-300 border rounded-md shadow-sm p-1"
                 value={sortOption}
                 onChange={(e) => setSortOption(e.target.value as SortOption)}
               >
                 <option value={SortOption.POINTS_DESC}>Mata Tertinggi</option>
                 <option value={SortOption.POINTS_ASC}>Mata Terendah</option>
                 <option value={SortOption.STARS_DESC}>Bintang Terbanyak</option>
                 <option value={SortOption.RECORDS_DESC}>Rekod Terbanyak</option>
                 <option value={SortOption.NAME_ASC}>Nama (A-Z)</option>
               </select>
             </div>
           </div>

           <StudentTable 
             students={sortedData} 
             currentSort={sortOption} 
             onSortChange={setSortOption}
           />
        </div>
      </main>

      {/* PDF Selection Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pilih Jenis Laporan PDF</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Bagaimana anda mahu menjana fail PDF untuk semua murid?
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => generatePDF('single')}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-500 transition-all group"
                    >
                        <div className="text-left">
                            <div className="font-semibold text-gray-900">Senarai Keseluruhan</div>
                            <div className="text-xs text-gray-500">Satu senarai panjang mengikut ranking sekolah.</div>
                        </div>
                        <span className="text-indigo-600 opacity-0 group-hover:opacity-100">→</span>
                    </button>

                    <button 
                        onClick={() => generatePDF('grouped')}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-500 transition-all group"
                    >
                        <div className="text-left">
                            <div className="font-semibold text-gray-900">Laporan Mengikut Kelas</div>
                            <div className="text-xs text-gray-500">Dipecahkan mengikut kelas (1B, 1C...) dengan ranking sendiri.</div>
                        </div>
                        <span className="text-indigo-600 opacity-0 group-hover:opacity-100">→</span>
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => setShowPdfModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};