// Smart Planter IoT Control with Firebase Realtime Database
// Firebase v9 Modular SDK Implementation

// Import Firebase v9 modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Device state tracking
let deviceStates = {
    light_status: 0,
    pump_status: 0,
    fan_status: 0
};

// Connection status tracking
let isConnected = false;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 Smart Planter Control System Initializing...');
    
    // Initialize Firebase listeners
    initializeFirebaseListeners();
    
    // Load initial states from database
    loadInitialStates();
    
    console.log('✅ System initialized successfully');
});

/**
 * Set up Firebase real-time listeners for all device controls
 */
function initializeFirebaseListeners() {
    console.log('🔗 Setting up Firebase listeners...');
    
    // Reference to the smart_planter controls in the database
    const controlsRef = ref(database, 'smart_planter/controls');
    
    // Listen for real-time changes in the database
    onValue(controlsRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            console.log('📡 Database update received:', data);
            
            // Update local state
            deviceStates = {
                light_status: data.light_status || 0,
                pump_status: data.pump_status || 0,
                fan_status: data.fan_status || 0
            };
            
            // Update UI to reflect database changes
            updateAllUI();
            
            // Update connection status
            setConnectionStatus(true);
        } else {
            console.log('📡 No data found in database');
            setConnectionStatus(false);
        }
    }, (error) => {
        console.error('❌ Firebase listener error:', error);
        setConnectionStatus(false);
    });
    
    // Listen for connection state
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
        const connected = snapshot.val();
        setConnectionStatus(connected);
        console.log('🔌 Connection status:', connected ? 'Connected' : 'Disconnected');
    });
}

/**
 * Load initial device states from Firebase
 */
async function loadInitialStates() {
    console.log('📥 Loading initial device states...');
    
    try {
        const controlsRef = ref(database, 'smart_planter/controls');
        const snapshot = await get(controlsRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('📥 Initial states loaded:', data);
            
            deviceStates = {
                light_status: data.light_status || 0,
                pump_status: data.pump_status || 0,
                fan_status: data.fan_status || 0
            };
            
            updateAllUI();
        } else {
            console.log('📥 No initial data found, initializing with default values...');
            // Initialize database with default OFF values
            await initializeDatabase();
        }
    } catch (error) {
        console.error('❌ Error loading initial states:', error);
        setConnectionStatus(false);
    }
}

/**
 * Initialize database with default values if it doesn't exist
 */
async function initializeDatabase() {
    console.log('🔧 Initializing database with default values...');
    
    try {
        const controlsRef = ref(database, 'smart_planter/controls');
        await set(controlsRef, {
            light_status: 0,
            pump_status: 0,
            fan_status: 0,
            last_updated: serverTimestamp()
        });
        
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
}

/**
 * Toggle device state and update Firebase
 * @param {string} deviceType - 'light', 'pump', or 'fan'
 */
window.toggleDevice = async function(deviceType) {
    console.log(`🔄 Toggling ${deviceType}...`);
    
    // Determine the correct database field name
    const fieldMap = {
        'light': 'light_status',
        'pump': 'pump_status',
        'fan': 'fan_status'
    };
    
    const fieldName = fieldMap[deviceType];
    if (!fieldName) {
        console.error('❌ Invalid device type:', deviceType);
        return;
    }
    
    try {
        // Toggle the state (0 becomes 1, 1 becomes 0)
        const newState = deviceStates[fieldName] === 1 ? 0 : 1;
        
        // Update local state immediately for responsive UI
        deviceStates[fieldName] = newState;
        updateDeviceUI(deviceType, newState);
        
        // Update Firebase database
        const deviceRef = ref(database, `smart_planter/controls/${fieldName}`);
        await set(deviceRef, newState);
        
        // Also update the last_updated timestamp
        const lastUpdatedRef = ref(database, 'smart_planter/controls/last_updated');
        await set(lastUpdatedRef, serverTimestamp());
        
        console.log(`✅ ${deviceType} updated to: ${newState === 1 ? 'ON' : 'OFF'}`);
        
    } catch (error) {
        console.error(`❌ Error toggling ${deviceType}:`, error);
        
        // Revert local state if Firebase update failed
        deviceStates[fieldName] = deviceStates[fieldName] === 1 ? 0 : 1;
        updateDeviceUI(deviceType, deviceStates[fieldName]);
        
        // Show error message to user
        showErrorMessage(`Failed to update ${deviceType}. Please try again.`);
    }
}

/**
 * Update UI for a specific device
 * @param {string} deviceType - 'light', 'pump', or 'fan'
 * @param {number} state - 0 for OFF, 1 for ON
 */
function updateDeviceUI(deviceType, state) {
    const isOn = state === 1;
    
    // Get UI elements
    const btn = document.getElementById(`${deviceType}Btn`);
    const icon = document.getElementById(`${deviceType}Icon`);
    const status = document.getElementById(`${deviceType}Status`);
    const stateElement = document.getElementById(`${deviceType}State`);
    
    if (!btn || !icon || !status || !stateElement) {
        console.error(`❌ UI elements not found for ${deviceType}`);
        return;
    }
    
    // Update button classes and content based on device type and state
    switch(deviceType) {
        case 'light':
            btn.className = `control-button ${isOn ? 'light-on' : 'light-off'}`;
            icon.textContent = isOn ? '💡' : '🔆';
            status.textContent = isOn ? 'ON' : 'OFF';
            stateElement.textContent = isOn ? 'Active' : 'Inactive';
            stateElement.className = `fw-bold ${isOn ? 'text-success' : 'text-muted'}`;
            break;
            
        case 'pump':
            btn.className = `control-button ${isOn ? 'pump-on' : 'pump-off'}`;
            icon.textContent = isOn ? '💧' : '🚰';
            status.textContent = isOn ? 'ON' : 'OFF';
            stateElement.textContent = isOn ? 'Pumping' : 'Idle';
            stateElement.className = `fw-bold ${isOn ? 'text-primary' : 'text-muted'}`;
            break;
            
        case 'fan':
            btn.className = `control-button ${isOn ? 'fan-on' : 'fan-off'}`;
            icon.textContent = isOn ? '🌪️' : '💨';
            status.textContent = isOn ? 'ON' : 'OFF';
            stateElement.textContent = isOn ? 'Running' : 'Stopped';
            stateElement.className = `fw-bold ${isOn ? 'text-info' : 'text-muted'}`;
            break;
    }
    
    console.log(`🎨 UI updated for ${deviceType}: ${isOn ? 'ON' : 'OFF'}`);
}

/**
 * Update UI for all devices
 */
function updateAllUI() {
    console.log('🎨 Updating all device UIs...');
    
    updateDeviceUI('light', deviceStates.light_status);
    updateDeviceUI('pump', deviceStates.pump_status);
    updateDeviceUI('fan', deviceStates.fan_status);
}

/**
 * Update connection status indicator
 * @param {boolean} connected - Connection state
 */
function setConnectionStatus(connected) {
    isConnected = connected;
    
    const statusElement = document.getElementById('connectionStatus');
    const textElement = document.getElementById('connectionText');
    const dotElement = document.getElementById('statusDot');
    
    if (statusElement && textElement && dotElement) {
        if (connected) {
            statusElement.className = 'connection-status connected';
            textElement.textContent = 'Connected';
            dotElement.className = 'status-indicator status-online';
        } else {
            statusElement.className = 'connection-status disconnected';
            textElement.textContent = 'Disconnected';
            dotElement.className = 'status-indicator status-offline';
        }
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    // Create a simple alert for now - you can enhance this with a custom modal
    console.error('❌ Error:', message);
    
    // You can replace this with a more sophisticated notification system
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '80px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050';
    alertDiv.style.maxWidth = '300px';
    
    alertDiv.innerHTML = `
        <strong>Error!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

/**
 * Export device states for debugging
 */
window.getDeviceStates = function() {
    return {
        deviceStates: deviceStates,
        isConnected: isConnected,
        timestamp: new Date().toISOString()
    };
}

// Log successful script loading
console.log('🚀 Smart Planter Control script loaded successfully!');