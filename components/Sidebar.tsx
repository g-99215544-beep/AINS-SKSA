import React from 'react';
import { CLASS_ORDER } from '../types';

interface SidebarProps {
  activeClass: string | null; // null means "All"
  onSelectClass: (className: string | null) => void;
  classNameList: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeClass, onSelectClass, classNameList, isOpen, onClose }) => {
  // Use defined order, or fallback to alphabetical from data
  const sortedClasses = CLASS_ORDER.filter(c => classNameList.includes(c));
  
  // Add any classes found in data but not in predefined list
  const otherClasses = classNameList.filter(c => !CLASS_ORDER.includes(c)).sort();
  const allClasses = [...sortedClasses, ...otherClasses];

  return (
    <>
      {/* Overlay for mobile (optional, adds focus) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <div 
        className={`w-64 bg-gray-800 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-700 shrink-0 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Analisis Murid</h1>
            <p className="text-xs text-gray-400 mt-1">SK Sri Aman</p>
          </div>
          {/* Close Button */}
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-2 pb-20">
          <button
            onClick={() => { onSelectClass(null); if(window.innerWidth < 1024) onClose(); }}
            className={`w-full text-left px-4 py-2 rounded mb-1 transition-colors ${
              activeClass === null ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Semua Murid
          </button>
          
          <div className="mt-4 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">Senarai Kelas</div>
          
          {allClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => { onSelectClass(cls); if(window.innerWidth < 1024) onClose(); }}
              className={`w-full text-left px-4 py-2 rounded mb-1 transition-colors text-sm ${
                activeClass === cls ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cls}
            </button>
          ))}
          
          {/* Special filter for unmatched students */}
          <button
              onClick={() => { onSelectClass('TIADA KELAS'); if(window.innerWidth < 1024) onClose(); }}
              className={`w-full text-left px-4 py-2 rounded mb-1 transition-colors text-sm ${
                activeClass === 'TIADA KELAS' ? 'bg-red-600 text-white' : 'text-red-300 hover:bg-gray-700'
              }`}
            >
              Tiada Kelas
            </button>
        </nav>
      </div>
    </>
  );
};
