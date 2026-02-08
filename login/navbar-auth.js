// Centralized navbar authentication logic
// This script handles navbar visibility based on user authentication state

import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize navbar authentication
function initNavbarAuth() {
    console.log('🔧 Initializing navbar authentication...');
    
    // Get navbar elements
    const navLogin = document.getElementById('nav-login');
    const navProfile = document.getElementById('nav-profile');
    const navLogout = document.getElementById('nav-logout');

    // Check if elements exist (some pages might not have all elements)
    if (!navLogin || !navProfile || !navLogout) {
        console.warn('⚠️ Navbar auth elements not found. Make sure all required elements exist with correct IDs.');
        console.warn('Missing elements:', {
            'nav-login': !navLogin,
            'nav-profile': !navProfile,
            'nav-logout': !navLogout
        });
        return;
    }

    console.log('✅ Navbar auth elements found');

    // Monitor authentication state changes
    onAuthStateChanged(auth, (user) => {
        console.log('🔄 Auth state changed:', user ? user.email : 'No user');
        
        if (user) {
            // User is logged in
            console.log('👤 User authenticated - showing profile/logout buttons');
            navLogin.style.display = 'none';
            navProfile.style.display = 'block';
            navLogout.style.display = 'block';
        } else {
            // User is logged out
            console.log('🚪 User not authenticated - showing login button');
            navLogin.style.display = 'block';
            navProfile.style.display = 'none';
            navLogout.style.display = 'none';
        }
    });
}

// Global logout function with user feedback
window.globalLogout = function() {
    console.log('🚪 Global logout initiated');
    
    // Show loading state
    const logoutBtn = document.querySelector('#nav-logout a');
    if (logoutBtn) {
        logoutBtn.innerHTML = 'מתנתק...';
    }
    
    signOut(auth).then(() => {
        console.log('✅ User logged out successfully');
        
        // Redirect to login page
        // Handle different directory levels
        if (window.location.pathname.includes('/login/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'login/login.html';
        }
    }).catch((error) => {
        console.error('❌ Logout error:', error);
        
        // Reset button text on error
        if (logoutBtn) {
            logoutBtn.innerHTML = 'התנתקות';
        }
        
        alert('שגיאה בהתנתקות, נסה שנית');
    });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initNavbarAuth);

// Export for manual initialization if needed
export { initNavbarAuth };