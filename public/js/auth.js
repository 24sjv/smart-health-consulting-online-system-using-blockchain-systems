/**
 * Authentication Module for Healthcare Application
 */

const Auth = {
  // Check if a user is logged in
  isLoggedIn() {
    return Boolean(
      localStorage.getItem('currentPatientId') || 
      localStorage.getItem('currentDoctorId') || 
      localStorage.getItem('currentAdminId')
    );
  },
  
  // Get current user info
  getCurrentUser() {
    const userType = this.getUserType();
    
    switch(userType) {
      case 'patient':
        return {
          id: localStorage.getItem('currentPatientId'),
          name: localStorage.getItem('currentPatientName'),
          type: 'patient'
        };
      case 'doctor':
        return {
          id: localStorage.getItem('currentDoctorId'),
          name: localStorage.getItem('currentDoctorName'),
          type: 'doctor'
        };
      case 'admin':
        return {
          id: localStorage.getItem('currentAdminId'),
          name: localStorage.getItem('currentAdminName'),
          type: 'admin'
        };
      default:
        return null;
    }
  },
  
  // Get user type (patient, doctor, admin)
  getUserType() {
    if (localStorage.getItem('currentPatientId')) return 'patient';
    if (localStorage.getItem('currentDoctorId')) return 'doctor';
    if (localStorage.getItem('currentAdminId')) return 'admin';
    return null;
  },
  
  // Login patient
  loginPatient(patientData) {
    localStorage.setItem('currentPatientId', patientData.id);
    localStorage.setItem('currentPatientName', patientData.fullName || patientData.name);
  },
  
  // Login doctor
  loginDoctor(doctorData) {
    localStorage.setItem('currentDoctorId', doctorData.id);
    localStorage.setItem('currentDoctorName', doctorData.fullName || doctorData.name);
  },
  
  // Login admin
  loginAdmin(adminData) {
    console.log('Admin login called with:', adminData);
    localStorage.setItem('currentAdminId', adminData.id);
    localStorage.setItem('currentAdminName', adminData.fullName || adminData.name);
    localStorage.setItem('adminLoggedIn', 'true'); // Add this for compatibility
    console.log('Admin login data set in localStorage');
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('currentPatientId');
    localStorage.removeItem('currentPatientName');
    localStorage.removeItem('currentDoctorId');
    localStorage.removeItem('currentDoctorName');
    localStorage.removeItem('currentAdminId');
    localStorage.removeItem('currentAdminName');
    localStorage.removeItem('adminLoggedIn');
    
    // Redirect to home page after logout
    window.location.href = '/';
  }
};

// Make Auth globally available
window.Auth = Auth;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Auth.js loaded and DOM ready');
  
  // Admin Login Form
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    console.log('Admin login form found, attaching event listener');
    
    adminLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Admin form submitted');
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      console.log('Login attempt with:', { username, password });
      
      // Simple admin check (in a real app, this would be server-side)
      if (username === 'admin' && password === 'admin') {
        console.log('Admin credentials valid');
        
        // Clear any error messages
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(e => e.style.display = 'none');
        
        try {
          Auth.loginAdmin({
            id: 'admin1',
            name: 'Administrator'
          });
          
          console.log('Admin login successful, redirecting...');
          
          // Use a short timeout to ensure localStorage is updated
          setTimeout(() => {
            console.log('Redirecting to admin controls');
            window.location.href = 'admin-controls.html';
          }, 100);
        } catch (error) {
          console.error('Error during admin login:', error);
          alert('Login error: ' + error.message);
        }
      } else {
        console.log('Admin credentials invalid');
        
        // Show error messages
        const usernameError = document.getElementById('usernameError');
        const passwordError = document.getElementById('passwordError');
        
        if (usernameError) {
          usernameError.textContent = 'Invalid username or password';
          usernameError.style.display = 'block';
        }
        
        if (passwordError) {
          passwordError.textContent = 'Invalid username or password';
          passwordError.style.display = 'block';
        }
      }
    });
  } else {
    console.log('Admin login form not found in the page');
  }
  
  // Patient Login Form
  const patientLoginForm = document.getElementById('patient-login-form');
  if (patientLoginForm) {
    patientLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Get patients from localStorage
      const patients = JSON.parse(localStorage.getItem('patients') || '[]');
      
      // Find matching patient
      const patient = patients.find(p => p.email === email && p.password === password);
      
      if (patient) {
        Auth.loginPatient(patient);
        localStorage.setItem('currentPatientId', patient.id);
        window.location.href = '/patient-dashboard.html';
      } else {
        alert('Invalid email or password');
      }
    });
  }
  
  // Doctor Login Form
  const doctorLoginForm = document.getElementById('doctor-login-form');
  if (doctorLoginForm) {
    doctorLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Get doctors from localStorage
      const doctors = JSON.parse(localStorage.getItem('doctors') || '[]');
      
      // Find matching doctor
      const doctor = doctors.find(d => d.email === email && d.password === password);
      
      if (doctor) {
        Auth.loginDoctor(doctor);
        window.location.href = '/doctor-dashboard.html';
      } else {
        alert('Invalid email or password');
      }
    });
  }
  
  // Logout Buttons
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      Auth.logout();
    });
  });
});
