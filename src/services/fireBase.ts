import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBq2lFR57BYJJrgF7rktBLiX14Mmncd9o4",
    authDomain: "quiz-app-38029.firebaseapp.com",
    projectId: "quiz-app-38029",
    storageBucket: "quiz-app-38029.firebasestorage.app",
    messagingSenderId: "79203695359",
    appId: "1:79203695359:web:9afd9c1f62b414aa88aaca",
    measurementId: "G-XVZZNVE3HS"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };