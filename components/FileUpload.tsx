import React, { useState } from 'react';
import { parseCSV, parseExcel } from '../utils/dataProcessing';
import { StudentPerformance } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: StudentPerformance[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isExcel) {
      setError("Sila muat naik fail format .csv atau .xlsx sahaja.");
      setFileName(null);
      return;
    }

    const reader = new FileReader();

    if (isCSV) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          try {
            const data = parseCSV(text);
            if (data.length === 0) {
                 setError("Tiada data murid dijumpai dalam fail CSV.");
            } else {
                 onDataLoaded(data);
            }
          } catch (err) {
            setError("Ralat memproses fail CSV.");
          }
        }
      };
      reader.readAsText(file);
    } else if (isExcel) {
      reader.onload = (event) => {
        const data = event.target?.result as ArrayBuffer;
        if (data) {
           try {
             const parsedData = parseExcel(data);
             if (parsedData.length === 0) {
                 setError("Tiada data murid dijumpai dalam fail Excel. Pastikan format betul.");
             } else {
                 onDataLoaded(parsedData);
             }
           } catch (err) {
             console.error(err);
             setError("Ralat memproses fail Excel.");
           }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Muat Naik Data Prestasi</h3>
      <p className="text-sm text-gray-500 mb-4">Sila muat naik fail CSV atau Excel (.xlsx) yang mengandungi data Bintang, Rekod, dan Mata.</p>
      
      <div className="flex flex-col gap-2">
        <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                cursor-pointer
              "
            />
        </label>
        {fileName && !error && <p className="text-green-600 text-sm mt-1">Fail dipilih: {fileName}</p>}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};