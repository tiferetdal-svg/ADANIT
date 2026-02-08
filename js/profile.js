// Profile Page JavaScript - Auth Protected
import { auth, database } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    ref, 
    get 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

console.log('👤 Profile module loaded');
console.log('Profile page loaded');

// ===== AUTH STATE MONITORING =====

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('✅ User is authenticated:', user.email);
        loadUserProfile(user);
    } else {
        console.log('❌ User is not authenticated');
        showNotAuthenticated();
    }
});

// ===== PROFILE FUNCTIONS =====

// Load and display user profile data
async function loadUserProfile(user) {
    console.log('📊 Loading user profile...');
    
    try {
        // Show loading state
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('profileContent').style.display = 'none';
        document.getElementById('notAuthenticatedState').style.display = 'none';
        
        // Get user data from database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        let userData = {};
        if (snapshot.exists()) {
            userData = snapshot.val();
            console.log('✅ User data loaded from database:', userData);
        } else {
            console.log('⚠️ No user data found in database, using auth data');
        }
        
        // Update UI elements
        const displayName = user.displayName || userData.name || userData.displayName || 'משתמש';
        const email = user.email || userData.email || 'לא זמין';
        const uid = user.uid || 'לא זמין';
        const createdAt = userData.createdAt ? formatDate(userData.createdAt) : 'לא זמין';
        
        // Get last login from user metadata
        const lastLogin = user.metadata.lastSignInTime ? formatDateTime(user.metadata.lastSignInTime) : 'לא זמין';
        console.log('🕐 Last login time:', user.metadata.lastSignInTime);
        
        // Update avatar with first letter of name
        const firstLetter = displayName.charAt(0).toUpperCase();
        document.getElementById('userAvatar').textContent = firstLetter;
        
        // Update profile information
        document.getElementById('userDisplayName').textContent = displayName;
        document.getElementById('userFullName').textContent = displayName;
        document.getElementById('userEmail').textContent = email;
        document.getElementById('userUID').textContent = uid;
        document.getElementById('userCreatedAt').textContent = createdAt;
        document.getElementById('userLastLogin').textContent = lastLogin;
        
        // Hide loading and show profile
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';
        
        console.log('✅ Profile UI updated successfully');
        
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        
        // Show basic profile with auth data only
        document.getElementById('userDisplayName').textContent = user.displayName || 'משתמש';
        document.getElementById('userFullName').textContent = user.displayName || 'לא זמין';
        document.getElementById('userEmail').textContent = user.email || 'לא זמין';
        document.getElementById('userUID').textContent = user.uid || 'לא זמין';
        document.getElementById('userCreatedAt').textContent = 'לא זמין';
        document.getElementById('userLastLogin').textContent = user.metadata.lastSignInTime ? formatDateTime(user.metadata.lastSignInTime) : 'לא זמין';
        
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';
    }
}

// Show not authenticated state
function showNotAuthenticated() {
    console.log('🔒 Showing not authenticated state');
    
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('profileContent').style.display = 'none';
    document.getElementById('notAuthenticatedState').style.display = 'block';
}

// Format date for display
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'תאריך לא תקין';
    }
}

// Format date and time for last login display
function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Error formatting date time:', error);
        return 'תאריך לא תקין';
    }
}

// ===== LOGOUT FUNCTION =====

// Handle user logout
export async function logout() {
    console.log('🚪 Logout function called');
    
    try {
        // Show loading state
        const logoutButton = document.querySelector('button[onclick="handleLogout()"]');
        if (logoutButton) {
            logoutButton.textContent = 'מתנתק...';
            logoutButton.disabled = true;
        }
        
        // Sign out from Firebase
        await signOut(auth);
        
        console.log('✅ User signed out successfully');
        
        // Clear any local storage
        localStorage.removeItem('user');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login/login.html';
        }, 500);
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        
        // Re-enable button on error
        const logoutButton = document.querySelector('button[onclick="handleLogout()"]');
        if (logoutButton) {
            logoutButton.textContent = '🚪 התנתק';
            logoutButton.disabled = false;
        }
        
        alert('שגיאה בהתנתקות, נסה שנית');
    }
}

// ===== GLOBAL FUNCTION ASSIGNMENT =====

// Make logout function globally available
window.handleLogout = logout;

console.log('🌍 Profile functions ready:', {
    handleLogout: typeof window.handleLogout
});

// ===== PAGE PROTECTION =====

// Protect the page - redirect if not authenticated after a timeout
setTimeout(() => {
    if (!auth.currentUser) {
        console.log('⏰ Auth timeout - no user found, redirecting to login');
        window.location.href = 'login/login.html';
    }
}, 5000); // 5 second timeout

console.log('🛡️ Profile page protection active');