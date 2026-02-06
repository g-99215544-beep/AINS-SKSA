import { MergedStudent, StudentClassInfo, StudentPerformance } from '../types';
import { db } from '../lib/firebase';
import { ref, get, child } from "firebase/database";
import * as XLSX from 'xlsx';

// Helper to normalize names for comparison (remove spaces, lowercase)
const normalizeName = (name: string): string => {
  if (!name) return '';
  return name.toString().toUpperCase().replace(/\s+/g, ' ').trim();
};

export const parseCSV = (csvText: string): StudentPerformance[] => {
  const lines = csvText.split('\n');
  const students: StudentPerformance[] = [];

  // Skip header if exists (starts with # or Nama)
  const startIndex = lines[0].startsWith('#') || lines[0].startsWith('Nama') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    
    if (parts.length >= 6) {
      const points = parseInt(parts[parts.length - 1]);
      const records = parseInt(parts[parts.length - 2]);
      const stars = parseInt(parts[parts.length - 3]);
      const email = parts[parts.length - 4];
      
      const nameParts = parts.slice(1, parts.length - 4);
      const name = nameParts.join(',').replace(/^"|"$/g, '');

      students.push({
        name: normalizeName(name),
        email,
        stars: isNaN(stars) ? 0 : stars,
        records: isNaN(records) ? 0 : records,
        points: isNaN(points) ? 0 : points,
      });
    }
  }
  return students;
};

export const parseExcel = (arrayBuffer: ArrayBuffer): StudentPerformance[] => {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to array of arrays
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  const students: StudentPerformance[] = [];
  
  // Find header row or start reading from row 1 (assuming index 0 is header)
  // We will use a heuristic similar to CSV: look for rows with numeric values at the end
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    // Check if row has enough data to be a student record
    if (row.length >= 5) {
       // Heuristic: check if the last few columns are numbers (Stars, Records, Points)
       // Adjust index based on data structure. 
       // Assuming structure roughly matches: [No, Name, Email, Stars, Records, Points]
       // or simply look for the numeric values at the end.
       
       const lastIdx = row.length - 1;
       const points = parseInt(row[lastIdx]);
       const records = parseInt(row[lastIdx - 1]);
       const stars = parseInt(row[lastIdx - 2]);
       
       // If these are valid numbers, it's likely a data row
       if (!isNaN(points) && !isNaN(records) && !isNaN(stars)) {
          const email = row[lastIdx - 3] || '';
          // Name might be in index 1, or combined. Let's assume Name is at index 1 for standard exports
          // or try to grab the string before email.
          const name = row[1]; // Usually Name is column 2 (index 1) in generated reports

          if (name && typeof name === 'string' && !name.toLowerCase().includes('nama')) {
             students.push({
                name: normalizeName(name),
                email: email.toString(),
                stars,
                records,
                points
             });
          }
       }
    }
  }

  return students;
};

// Helper to map DB Class Codes (e.g., 1B) to Full Names (e.g., 1 BESTARI)
const mapClassCodeToName = (code: string): string => {
  const year = code.charAt(0);
  const letter = code.charAt(1);
  
  let classNameSuffix = '';
  switch(letter) {
    case 'B': classNameSuffix = 'BESTARI'; break;
    case 'C': classNameSuffix = 'CEMERLANG'; break;
    case 'G': classNameSuffix = 'GEMILANG'; break;
    default: classNameSuffix = letter; // Fallback
  }
  
  return `${year} ${classNameSuffix}`;
};

export const fetchClassDataFromFirebase = async (): Promise<StudentClassInfo[]> => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, 'config/classes/classData'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const students: StudentClassInfo[] = [];

      // data structure is { "1B": ["Name1", "Name2"], "1C": [...], ... }
      Object.entries(data).forEach(([classCode, studentNames]: [string, any]) => {
        const fullClassName = mapClassCodeToName(classCode);
        
        if (Array.isArray(studentNames)) {
          studentNames.forEach((name: string) => {
            if (name) {
               students.push({
                name: normalizeName(name),
                className: fullClassName,
                gender: 'L', // Default/Unknown as DB only has names
                idNumber: '-' // Unknown as DB only has names
              });
            }
          });
        }
      });
      return students;
    } else {
      console.log("No data available");
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const mergeStudentData = (
  performanceData: StudentPerformance[],
  classData: StudentClassInfo[]
): MergedStudent[] => {
  const classMap = new Map<string, StudentClassInfo>();
  
  classData.forEach(s => {
    classMap.set(s.name, s);
  });

  let merged: MergedStudent[] = performanceData.map(p => {
    const classInfo = classMap.get(p.name);
    return {
      ...p,
      className: classInfo ? classInfo.className : 'TIADA KELAS',
      gender: classInfo?.gender,
      idNumber: classInfo?.idNumber
    };
  });

  return merged;
};