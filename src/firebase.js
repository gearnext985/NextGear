import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBC2_yDqwpXQy25JwvYWdkS2RUoM-Fld4Y",
    authDomain: "nextgear-28312.firebaseapp.com",
    projectId: "nextgear-28312",
    storageBucket: "nextgear-28312.firebasestorage.app",
    messagingSenderId: "1054028740375",
    appId: "1:1054028740375:web:d4c1d2b53765470c132952",
    measurementId: "G-GG1RPZ8P5T"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
