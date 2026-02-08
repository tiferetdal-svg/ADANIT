
// קובץ JavaScript כללי לאתר

// פונקציה לטעינת הדף
document.addEventListener('DOMContentLoaded', function() { // מאזין לאירוע טעינה מלאה של הדף
    console.log('האתר נטען בהצלחה'); // הודעת לוג לקונסול
    
    // הוספת אנימציות לכרטיסים
    addCardAnimations(); // הפעלת פונקציית אנימציות כרטיסים
    
    // הוספת אפקטים לטפסים
    addFormEffects(); // הפעלת פונקציית אפקטי טפסים
});

// הוספת אנימציות לכרטיסים
function addCardAnimations() { // פונקציה להוספת אנימציות לכרטיסים
    const cards = document.querySelectorAll('.card'); // קבלת כל הכרטיסים בדף
    cards.forEach(card => { // לולאה על כל כרטיס
        card.addEventListener('mouseenter', function() { // מאזין לכניסת עכבר
            this.style.transform = 'translateY(-2px)'; // הזזה למעלה של 2 פיקסל
            this.style.transition = 'transform 0.3s ease'; // אנימציה חלקה של 0.3 שניות
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; // הוספת צל
        });
        
        card.addEventListener('mouseleave', function() { // מאזין ליציאת עכבר
            this.style.transform = 'translateY(0)'; // החזרת הכרטיס למקום המקורי
            this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; // החזרת צל קטן
        });
    });
}

// הוספת אפקטים לטפסים
function addFormEffects() { // פונקציה להוספת אפקטים לטפסים
    const formInputs = document.querySelectorAll('input, textarea, select'); // קבלת כל שדות הטפסים
    formInputs.forEach(input => { // לולאה על כל שדה
        input.addEventListener('focus', function() { // מאזין לפוקוס על השדה
            this.style.borderColor = '#4caf50'; // שינוי צבע גבול לירוק
            this.style.boxShadow = '0 0 0 0.2rem rgba(76, 175, 80, 0.25)'; // הוספת צל ירוק
        });
        
        input.addEventListener('blur', function() { // מאזין לאיבוד פוקוס
            this.style.borderColor = '#dee2e6'; // החזרת צבע גבול רגיל
            this.style.boxShadow = 'none'; // הסרת צל
        });
    });
}

// פונקציה להחלקת גלילה
function smoothScrollTo(targetId) { // פונקציה לגלילה חלקה לאלמנט מסוים
    const target = document.getElementById(targetId); // קבלת האלמנט לפי מזהה
    if (target) { // בדיקה אם האלמנט קיים
        target.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// פונקציה לבדיקת תקינות אימייל
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// פונקציה להצגת הודעות
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // מציאת מקום להציג את ההודעה
    const container = document.querySelector('.container, .container-fluid');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // הסרת ההודעה אחרי 5 שניות
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// פונקציה לטיפול בשגיאות טפסים
function handleFormError(formElement, errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-2';
    errorDiv.textContent = errorMessage;
    
    // הסרת שגיאות קודמות
    const existingError = formElement.querySelector('.alert-danger');
    if (existingError) {
        existingError.remove();
    }
    
    formElement.appendChild(errorDiv);
}

// פונקציה לניקוי הודעות שגיאה
function clearFormErrors(formElement) {
    const errors = formElement.querySelectorAll('.alert-danger');
    errors.forEach(error => error.remove());
}