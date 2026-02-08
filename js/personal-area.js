// Smart Planter Firebase Integration
import { database } from './firebase-config.js';
import { 
    ref, 
    set, 
    get, 
    onValue,
    update 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

console.log('🌱 Smart Planter script loading...');

// משתנים למעקב אחרי מצב הכפתורים (רק משאבה ומאוורר)
let deviceStates = {
    pump_status: 0,
    fan_status: 0
};

// ==========================================
// חלק 1: שליטה (שולח ל- /toAltera)
// ==========================================

// Pump Control
async function togglePump() {
    try {
        console.log('💧 Toggling pump...');
        const pumpRef = ref(database, '/toAltera');
        const memoryRef = ref(database, 'smart_planter/controls'); 
       
        if (deviceStates.pump_status === 0) {
            // הפעלה (שולח 129)
            await set(pumpRef, 129);
            await update(memoryRef, { pump_status: 1 });
            deviceStates.pump_status = 1;
        } else {
            // כיבוי (שולח 128)
            await set(pumpRef, 128);
            await update(memoryRef, { pump_status: 0 });
            deviceStates.pump_status = 0;
        }
        
        updatePumpUI(deviceStates.pump_status);
    } catch (error) {
        console.error('❌ Error updating pump:', error);
    }
}

// Fan Control
async function toggleFan() {
    try {
        console.log('🌪️ Toggling fan...');
        const fanRef = ref(database, '/toAltera');
        const memoryRef = ref(database, 'smart_planter/controls'); 

        if (deviceStates.fan_status === 0) {
            // הפעלה (שולח 65)
            await set(fanRef, 65);
            await update(memoryRef, { fan_status: 1 });
            deviceStates.fan_status = 1;
        } else {
            // כיבוי (שולח 64)
            await set(fanRef, 64);
            await update(memoryRef, { fan_status: 0 });
            deviceStates.fan_status = 0;
        }

        updateFanUI(deviceStates.fan_status);
    } catch (error) {
        console.error('❌ Error updating fan:', error);
    }
}

// ==========================================
// חלק 2: תצוגה - כל החיישנים והמצלמה
// ==========================================

function setupFirebaseListeners() {
    console.log('🔗 Setting up all Sensor listeners...');
    
    // 1. נתונים מאלטרה (A, B, C)
    const feedbackRef = ref(database, '/fromAltera');
    onValue(feedbackRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // A -> חיישן מרחק
            if (data.A !== undefined) {
                const el = document.getElementById('sensor-dist');
                if(el) el.textContent = data.A + ' cm';
            }
            // B -> חיישן גובה מים
            if (data.B !== undefined) {
                const el = document.getElementById('sensor-water');
                if(el) el.textContent = data.B + '%';
            }
            // C -> חיישן לחות אדמה
            if (data.C !== undefined) {
                const el = document.getElementById('sensor-soil');
                if(el) el.textContent = data.C;
            }
        }
    });

    // 2. טמפרטורה (חדש! קורא מ- /TEMP)
    const tempRef = ref(database, '/TEMP');
    onValue(tempRef, (snapshot) => {
        const val = snapshot.val();
        const el = document.getElementById('sensor-temp');
        if (el && val !== null && val !== undefined) {
            el.textContent = val + '°C';
        }
    });

    // 3. לחות אוויר (חדש! קורא מ- /HUMIDITY)
    const humidityRef = ref(database, '/HUMIDITY');
    onValue(humidityRef, (snapshot) => {
        const val = snapshot.val();
        const el = document.getElementById('sensor-humidity');
        if (el && val !== null && val !== undefined) {
            el.textContent = val + '%';
        }
    });

    // 4. מצלמה (מענף camIp)
    const camRef = ref(database, '/camIp');
    onValue(camRef, (snapshot) => {
        const ip = snapshot.val();
        const imgEl = document.getElementById('camera-stream'); 
        const ipDisplay = document.getElementById('ip-display');
        const statusBadge = document.getElementById('cam-status');

        if (ip && imgEl) {
            if (ipDisplay) ipDisplay.textContent = ip;
            imgEl.src = `http://${ip}:81/stream`; 
            if (statusBadge) {
                statusBadge.textContent = "מחובר";
                statusBadge.className = "badge bg-danger"; 
            }
        }
    });
}

// ==========================================
// פונקציות עזר (UI וטעינה)
// ==========================================

function updatePumpUI(status) {
    const pumpBtn = document.getElementById('btn-pump');
    const pumpText = document.getElementById('pumpText');
    if (pumpBtn && pumpText) {
        if (status === 1) {
            pumpBtn.className = 'btn control-btn pump-btn-on w-100';
            pumpText.textContent = 'משאבה פועלת';
        } else {
            pumpBtn.className = 'btn control-btn pump-btn-off w-100';
            pumpText.textContent = 'משאבה כבויה';
        }
    }
}

function updateFanUI(status) {
    const fanBtn = document.getElementById('btn-fan');
    const fanText = document.getElementById('fanText');
    if (fanBtn && fanText) {
        if (status === 1) {
            fanBtn.className = 'btn control-btn fan-btn-on w-100';
            fanText.textContent = 'מאוורר פועל';
        } else {
            fanBtn.className = 'btn control-btn fan-btn-off w-100';
            fanText.textContent = 'מאוורר כבוי';
        }
    }
}

// טעינת מצב כפתורים מהזיכרון
async function loadInitialStates() {
    try {
        const controlsRef = ref(database, 'smart_planter/controls');
        const snapshot = await get(controlsRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            deviceStates = {
                pump_status: data.pump_status || 0,
                fan_status: data.fan_status || 0
            };
        } else {
            await initializeDatabase();
        }
        updatePumpUI(deviceStates.pump_status);
        updateFanUI(deviceStates.fan_status);
    } catch (error) {
        console.error('❌ Error loading initial states:', error);
    }
}

async function initializeDatabase() {
    const controlsRef = ref(database, 'smart_planter/controls');
    await set(controlsRef, { pump_status: 0, fan_status: 0 });
}

// אתחול
document.addEventListener('DOMContentLoaded', async function() {
    await loadInitialStates();     
    setupFirebaseListeners();      
    
    const pumpBtn = document.getElementById('btn-pump');
    const fanBtn = document.getElementById('btn-fan');
    
    if (pumpBtn) pumpBtn.addEventListener('click', togglePump);
    if (fanBtn) fanBtn.addEventListener('click', toggleFan);
});