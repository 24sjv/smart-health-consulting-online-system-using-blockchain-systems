/**
 * Admin-specific functionality for Healthcare Application
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin.js loaded');
  
  // Check if we're on the admin login page
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    console.log('On admin login page');
    
    // Clear any existing admin session for security
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentAdminId');
    localStorage.removeItem('currentAdminName');
    
    // Add submit handler with special logging
    adminLoginForm.addEventListener('submit', function(e) {
      console.log('Admin form submit intercepted by admin.js');
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Admin credentials check
      if (username === 'admin' && password === 'admin') {
        console.log('Admin credentials verified by admin.js');
        
        // Set both auth methods for compatibility
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('currentAdminId', 'admin1');
        localStorage.setItem('currentAdminName', 'Administrator');
        
        console.log('Admin session data saved, redirecting...');
        
        // Use timeout to ensure storage is updated
        setTimeout(function() {
          window.location.href = 'admin-controls.html';
        }, 100);
        
        // Prevent default form handling and other handlers
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    }, true); // Use capturing to run before other handlers
  }
  
  // Check if we're on admin controls or view pages
  const isAdminPage = document.querySelector('.admin-control-panel') || 
                      window.location.pathname.includes('admin-');
  
  if (isAdminPage) {
    // Verify admin authentication
    if (localStorage.getItem('adminLoggedIn') !== 'true' && 
        !localStorage.getItem('currentAdminId')) {
      console.warn('Unauthorized access to admin page');
      window.location.href = 'admin-login.html';
      return;
    }
    
    // Set admin name if element exists
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement) {
      const adminName = localStorage.getItem('currentAdminName') || 'Administrator';
      adminNameElement.textContent = adminName;
    }
    
    // Admin logout handler
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear admin session
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('currentAdminId');
        localStorage.removeItem('currentAdminName');
        
        console.log('Admin logged out');
        window.location.href = 'index.html';
      });
    }
  }
}); 

// This should be in the doctor's prescription form submission handler
function submitPrescription() {
    const prescriptionData = {
        id: 'PRESC-' + Date.now(),
        patientId: selectedPatientId,
        patientID: selectedPatientId, // Add both ID formats
        doctorId: localStorage.getItem('currentDoctorId'),
        doctorName: localStorage.getItem('currentDoctorName') || 'Dr. Smith',
        medications: [...selectedMedications],
        instructions: document.getElementById('instructions').value,
        date: new Date().toISOString(),
        type: 'prescription',
        status: 'active',
        visibleToPatient: true // Add visibility flag
    };

    // Update all relevant storage locations
    const updateSources = {
        'prescriptions': (arr) => arr.push(prescriptionData),
        'doctor-prescriptions': (arr) => arr.push(prescriptionData),
        'appointments': (arr) => {
            const appointment = arr.find(a => 
                a.patientId === selectedPatientId && 
                a.status === 'Completed'
            );
            if(appointment) appointment.prescription = prescriptionData;
        }
    };

    Object.entries(updateSources).forEach(([key, updater]) => {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        updater(data);
        localStorage.setItem(key, JSON.stringify(data));
    });

    alert('Prescription submitted successfully!');
} 