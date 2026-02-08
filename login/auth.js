// Firebase Authentication System
// Import Firebase modules from CDN (v9 modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { 
    getDatabase, 
    ref, 
    set 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

console.log('🔥 Firebase Auth module loaded');

// ===== STEP 1: PASTE YOUR FIREBASE CONFIG HERE =====
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
const auth = getAuth(app);
const database = getDatabase(app);

console.log('✅ Firebase initialized');

// ===== UTILITY FUNCTIONS =====

// Function to show messages to user
function showMessage(elementId, message, type = 'info') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide after 5 seconds for errors
        if (type === 'error') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
}

// Function to translate Firebase errors to Hebrew
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'כתובת אימייל לא תקינה';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'שם משתמש או סיסמה שגויים';
        case 'auth/email-already-in-use':
            return 'האימייל הזה כבר רשום במערכת';
        case 'auth/weak-password':
            return 'הסיסמה חייבת להכיל לפחות 6 תווים';
        case 'auth/too-many-requests':
            return 'יותר מדי נסיונות התחברות. נסה שנית מאוחר יותר';
        default:
            return 'אירעה שגיאה, נסה שנית';
    }
}

// ===== ACTION 3: LOGIN FUNCTION =====
window.handleLogin = async function() {
    console.log('🔐 Login attempt started');
    
    // Get input values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validate inputs
    if (!email || !password) {
        showMessage('login-message', 'אנא מלא את כל השדות', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showMessage('login-message', 'כתובת אימייל לא תקינה', 'error');
        return;
    }
    
    try {
        showMessage('login-message', 'מתחבר...', 'info');
        
        // Sign in with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Login successful:', user.email);
        
        // Show success message
        showMessage('login-message', 'התחברות הצליחה! מעביר לפרופיל...', 'success');
        
        // Redirect to profile page
        setTimeout(() => {
            window.location.href = '../profile.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Login error:', error.code);
        showMessage('login-message', getErrorMessage(error.code), 'error');
    }
};

// ===== ACTION 1: SIGN UP FUNCTION =====
window.handleSignUp = async function() {
    console.log('📝 Sign up attempt started');
    
    // Get input values
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    
    // Validate inputs
    if (!name || !email || !password) {
        showMessage('signup-message', 'אנא מלא את כל השדות', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showMessage('signup-message', 'כתובת אימייל לא תקינה', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('signup-message', 'הסיסמה חייבת להכיל לפחות 6 תווים', 'error');
        return;
    }
    
    try {
        showMessage('signup-message', 'יוצר חשבון...', 'info');
        
        // ACTION 1: Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ User created:', user.email);
        
        // ACTION 2: Save user details to Realtime Database
        console.log('💾 Saving user data to database...');
        await set(ref(database, `users/${user.uid}`), {
            name: name,
            email: email,
            uid: user.uid,
            createdAt: new Date().toISOString()
        });
        
        console.log('✅ User data saved to database');
        
        // Show success message
        showMessage('signup-message', 'הרשמה הצליחה! מעביר לפרופיל...', 'success');
        
        // Redirect to profile page
        setTimeout(() => {
            window.location.href = '../profile.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Sign up error:', error.code);
        showMessage('signup-message', getErrorMessage(error.code), 'error');
    }
};

console.log('🎉 Auth functions ready: handleLogin, handleSignUp');