export interface StudentPerformance {
  rank?: number;
  name: string;
  email: string;
  stars: number;
  records: number;
  points: number;
}

export interface StudentClassInfo {
  name: string;
  className: string;
  gender: 'L' | 'P';
  idNumber: string;
}

export interface MergedStudent extends StudentPerformance {
  className: string; // "TIDAK BERDAFTAR" if not found in class list
  gender?: 'L' | 'P';
  idNumber?: string;
}

export enum SortOption {
  POINTS_DESC = 'POINTS_DESC',
  POINTS_ASC = 'POINTS_ASC',
  NAME_ASC = 'NAME_ASC',
  STARS_DESC = 'STARS_DESC',
  RECORDS_DESC = 'RECORDS_DESC',
}

export const CLASS_ORDER = [
  '1 BESTARI', '1 CEMERLANG', '1 GEMILANG',
  '2 BESTARI', '2 CEMERLANG', '2 GEMILANG',
  '3 BESTARI', '3 CEMERLANG', '3 GEMILANG',
  '4 BESTARI', '4 CEMERLANG', '4 GEMILANG',
  '5 BESTARI', '5 CEMERLANG', '5 GEMILANG',
  '6 BESTARI', '6 CEMERLANG', '6 GEMILANG'
];