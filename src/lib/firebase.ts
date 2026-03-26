import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5vEXTLDeFHN4sbds--EAQEBAHhBqpY5o",
  authDomain: "qns-padel.firebaseapp.com",
  projectId: "qns-padel",
  storageBucket: "qns-padel.firebasestorage.app",
  messagingSenderId: "1072072752598",
  appId: "1:1072072752598:web:8c5460df222fdb8f8db877",
  measurementId: "G-97QBZFEE23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
