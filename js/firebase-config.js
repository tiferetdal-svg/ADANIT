// Shared Firebase Configuration and Initialization
// Firebase v10+ Modular SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

console.log('🔥 Firebase Config loading...');

// ===== ACTUAL FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyBAeXCLtxDl-C0CdRG3e5cgaD7Uwc7WhaE",
    authDomain: "adanit-ecb78.firebaseapp.com",
    databaseURL: "https://adanit-ecb78-default-rtdb.firebaseio.com",
    projectId: "adanit-ecb78",
    storageBucket: "adanit-ecb78.firebasestorage.app",
    messagingSenderId: "741983407880",
    appId: "1:741983407880:web:0cca1cde1fef27b851e6bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and database for use across the app
export const auth = getAuth(app);
export const database = getDatabase(app);

console.log('✅ Firebase initialized and exported');

// Export firebaseConfig for debugging if needed
export { firebaseConfig };