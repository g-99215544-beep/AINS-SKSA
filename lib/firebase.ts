import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase 1: Senarai nama murid + kelas (READ - kehadiran-murid)
const kehadiranConfig = {
  apiKey: "AIzaSyDbCgDz2vK2BZUpwM3iDWJcPQSptVcNkv4",
  authDomain: "kehadiran-murid-6ece0.firebaseapp.com",
  databaseURL: "https://kehadiran-murid-6ece0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kehadiran-murid-6ece0",
  storageBucket: "kehadiran-murid-6ece0.firebasestorage.app",
  messagingSenderId: "223849234784",
  appId: "1:223849234784:web:e1471ded7ea17ba60bde05",
  measurementId: "G-4DY138HKTW"
};

// Firebase 2: Simpan data prestasi (WRITE - ains-data-sksa)
const ainsDataConfig = {
  apiKey: "AIzaSyAk2J3L0tgCNQFiB-pNmLSPmX4-87g2vH4",
  authDomain: "ains-data-sksa.firebaseapp.com",
  databaseURL: "https://ains-data-sksa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ains-data-sksa",
  storageBucket: "ains-data-sksa.firebasestorage.app",
  messagingSenderId: "689957921373",
  appId: "1:689957921373:web:5f452b7a6642808b8a63b4",
  measurementId: "G-GMS1TY8K1W"
};

const kehadiranApp = initializeApp(kehadiranConfig, "kehadiran");
const ainsDataApp = initializeApp(ainsDataConfig, "ainsData");

// DB untuk baca senarai murid/kelas
export const dbKehadiran = getDatabase(kehadiranApp);

// DB untuk simpan/baca data prestasi
export const dbAinsData = getDatabase(ainsDataApp);
