import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAk2J3L0tgCNQFiB-pNmLSPmX4-87g2vH4",
  authDomain: "ains-data-sksa.firebaseapp.com",
  databaseURL: "https://ains-data-sksa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ains-data-sksa",
  storageBucket: "ains-data-sksa.firebasestorage.app",
  messagingSenderId: "689957921373",
  appId: "1:689957921373:web:5f452b7a6642808b8a63b4",
  measurementId: "G-GMS1TY8K1W"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
