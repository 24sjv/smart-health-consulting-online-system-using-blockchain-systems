/**
 * Initialization script for the Healthcare Application
 */

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Healthcare application initializing...');
  
  // Check if user is logged in
  const currentPatient = localStorage.getItem('currentPatientId');
  const currentDoctor = localStorage.getItem('currentDoctorId');
  const currentAdmin = localStorage.getItem('currentAdminId');
  
  // Set user status in menu if applicable
  updateUserStatus(currentPatient, currentDoctor, currentAdmin);
  
  // Initialize any page-specific functionality
  initPageSpecific();
  
  console.log('Healthcare application initialized');
});

// Update menu based on user login status
function updateUserStatus(patientId, doctorId, adminId) {
  const isLoggedIn = patientId || doctorId || adminId;
  
  // Example: Update login/logout buttons
  const loginLinks = document.querySelectorAll('.login-btn');
  const registerLinks = document.querySelectorAll('.register-btn');
  const logoutLinks = document.querySelectorAll('.logout-btn');
  const profileLinks = document.querySelectorAll('.profile-btn');
  
  if (isLoggedIn) {
    // Hide login/register, show logout/profile
    loginLinks.forEach(link => link.style.display = 'none');
    registerLinks.forEach(link => link.style.display = 'none');
    logoutLinks.forEach(link => link.style.display = 'inline-block');
    profileLinks.forEach(link => link.style.display = 'inline-block');
    
    // Add username to profile if available
    const userName = 
      localStorage.getItem('currentPatientName') || 
      localStorage.getItem('currentDoctorName') || 
      localStorage.getItem('currentAdminName') || 
      'User';
    
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
      if (el) el.textContent = userName;
    });
  } else {
    // Show login/register, hide logout/profile
    loginLinks.forEach(link => link.style.display = 'inline-block');
    registerLinks.forEach(link => link.style.display = 'inline-block');
    logoutLinks.forEach(link => link.style.display = 'none');
    profileLinks.forEach(link => link.style.display = 'none');
  }
}

// Initialize page-specific functionality
function initPageSpecific() {
  const pagePath = window.location.pathname;
  
  // Home page
  if (pagePath === '/' || pagePath === '/index.html') {
    console.log('Home page initialized');
  }
  
  // Patient dashboard
  else if (pagePath.includes('patient-dashboard')) {
    // Check if user is logged in
    if (!localStorage.getItem('currentPatientId')) {
      console.warn('Unauthorized access to patient dashboard');
      // Redirect to login if not logged in
      window.location.href = '/patient-login.html';
      return;
    }
    
    console.log('Patient dashboard initialized');
  }
  
  // Doctor dashboard
  else if (pagePath.includes('doctor-dashboard')) {
    // Check if user is logged in
    if (!localStorage.getItem('currentDoctorId')) {
      console.warn('Unauthorized access to doctor dashboard');
      // Redirect to login if not logged in
      window.location.href = '/doctor-login.html';
      return;
    }
    
    console.log('Doctor dashboard initialized');
  }
  
  // Admin dashboard
  else if (pagePath.includes('admin-dashboard')) {
    // Check if user is logged in
    if (!localStorage.getItem('currentAdminId')) {
      console.warn('Unauthorized access to admin dashboard');
      // Redirect to login if not logged in
      window.location.href = '/admin-login.html';
      return;
    }
    
    console.log('Admin dashboard initialized');
  }
}

// Helper function to format date
window.formatDate = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Helper function to format time
window.formatTime = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper function to format date and time
window.formatDateTime = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
