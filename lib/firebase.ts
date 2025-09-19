import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCNk5DhVo7FTFNT_t3EE4JAJMvZKx2Mluk",
    authDomain: "finscope-734d2.firebaseapp.com",
    projectId: "finscope-734d2",
    storageBucket: "finscope-734d2.firebasestorage.app",
    messagingSenderId: "138047454016",
    appId: "1:138047454016:web:93790350a0b12316d098a5"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);
