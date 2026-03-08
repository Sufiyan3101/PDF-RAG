// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1WQeoZOsHiHgBUT3y7a6z12c3UEhfDeg",
  authDomain: "pdf-rag-177f7.firebaseapp.com",
  projectId: "pdf-rag-177f7",
  storageBucket: "pdf-rag-177f7.firebasestorage.app",
  messagingSenderId: "212318017621",
  appId: "1:212318017621:web:4de4834138164b84169cdc",
  measurementId: "G-NH45XM46JJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth()

export { app, auth};